"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useSocket } from "./useSocket";
import config from "../config/config.js";

interface UseWebRTCProps {
  onRemoteStream?: (stream: MediaStream) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  onMatched?: (data: {
    roomId: string;
    otherUser: { id: string; name: string };
  }) => void;
}

export const useWebRTC = ({
  onRemoteStream,
  onConnectionStateChange,
  onMatched,
}: UseWebRTCProps = {}) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMediaReady, setIsMediaReady] = useState(false)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaPermissions, setMediaPermissions] = useState<{
    camera: boolean;
    microphone: boolean;
  }>({ camera: false, microphone: false });
  const [isMatched, setIsMatched] = useState(false);
  const [isInitiator, setIsInitiator] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socket = useSocket(config.SERVER_URL);

  
  const initializePeerConnection = useCallback(() => {

    if (peerConnection.current) {
      peerConnection.current.close();
    }

    const config: RTCConfiguration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
      ],
    };

    peerConnection.current = new RTCPeerConnection(config);

    
    peerConnection.current.ontrack = (event) => {

      const [stream] = event.streams;
      setRemoteStream(stream);

      onRemoteStream?.(stream);
    };

    
    peerConnection.current.onconnectionstatechange = () => {
      const state = peerConnection.current?.connectionState;
      setIsConnected(state === "connected");
      onConnectionStateChange?.(state || "disconnected");

      if (state === "failed" || state === "disconnected") {
        handlePeerDisconnection();
      }
    };

    
    peerConnection.current.oniceconnectionstatechange = () => {
      const iceState = peerConnection.current?.iceConnectionState;
    };

    
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("ice-candidate", { candidate: event.candidate });
      } else {
        console.log("ICE gathering 1complete");
      }
    };

    
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        peerConnection.current?.addTrack(track, localStream);
      });
    }

    return peerConnection.current;
  }, [localStream, socket, onRemoteStream, onConnectionStateChange]);

  
  const handlePeerDisconnection = useCallback(() => {
    setRemoteStream(null);
    setIsConnected(false);
    setIsMatched(false);
    setIsInitiator(false);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    socket.emit("find-new")
  }, []);

  
  const createOffer = useCallback(async () => {
    if (!peerConnection.current || !socket) {
      return;
    }

    try {
      const offer = await peerConnection.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await peerConnection.current.setLocalDescription(offer);

      socket.emit("call-offer", { offer });
    } catch (err) {
      setError("Failed to create call offer");
    }
  }, [socket]);

  
  const handleOffer = useCallback(
    async (offer: RTCSessionDescriptionInit) => {
      if (!peerConnection.current || !socket) {
        return;
      }

      try {
        await peerConnection.current.setRemoteDescription(offer);

        const answer = await peerConnection.current.createAnswer();

        await peerConnection.current.setLocalDescription(answer);

        socket.emit("call-answer", { answer });
      } catch (err) {
        setError("Failed to handle call offer");
      }
    },
    [socket]
  );

  
  const handleAnswer = useCallback(
    async (answer: RTCSessionDescriptionInit) => {
      if (!peerConnection.current) {
        return;
      }

      try {
        await peerConnection.current.setRemoteDescription(answer);
      } catch (err) {
        setError("Failed to handle call answer");
      }
    },
    []
  );

  
  const handleIceCandidate = useCallback(
    async (candidate: RTCIceCandidateInit) => {
      if (!peerConnection.current) {
        return;
      }

      try {
        await peerConnection.current.addIceCandidate(candidate);
      } catch (err) {
        console.error("Error adding ICE candidate ----- ", err);
      }
    },
    []
  );

  
  const startWebRTCConnection = useCallback(
    (matchData: {
      roomId: string;
      otherUser: { id: string; name: string };
    }) => {
      setIsMatched(true);

      
      const shouldInitiate = currentUserId < matchData.otherUser.id;
      setIsInitiator(shouldInitiate);
      
      setTimeout(() => {
        initializePeerConnection();

        if (shouldInitiate) {
          setTimeout(() => {
            createOffer();
          }, 1000);
        }
      }, 500);
    },
    [currentUserId, initializePeerConnection, createOffer]
  );

  
  const getUserMedia = useCallback(async (video = true, audio = true) => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: video ? { width: 1280, height: 720, facingMode: "user" } : false,
        audio: audio,
      });

      setLocalStream(stream);
      setMediaPermissions({
        camera: video && stream.getVideoTracks().length > 0,
        microphone: audio && stream.getAudioTracks().length > 0,
      });

      
      
      if (localVideoRef.current && localVideoRef.current.srcObject !== stream) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch((err) => {
          
          if (err.name !== "AbortError") {
            console.error("Video play error ------ ", err);
          }
        });
      }
      

      return stream;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to access camera/microphone";
      setError(errorMessage);
      console.error("Error accessing media devices ------ ", err);
      throw err;
    }
  }, []); 

  
  const stopMedia = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
      });
      setLocalStream(null);
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    setMediaPermissions({ camera: false, microphone: false });
    setRemoteStream(null);
    setIsConnected(false);
    setIsMatched(false);
    setIsInitiator(false);
  }, [localStream]); 

  
  const toggleCamera = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setMediaPermissions((prev) => ({
          ...prev,
          camera: videoTrack.enabled,
        }));
        console.log("camera state --- ", videoTrack.enabled);
      }
    }
  }, [localStream]);

  
  const toggleMicrophone = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMediaPermissions((prev) => ({
          ...prev,
          microphone: audioTrack.enabled,
        }));
        console.log("mic state --- ", audioTrack.enabled);
      }
    }
  }, [localStream]);

  useEffect(() => {
    if (!remoteVideoRef.current || !remoteStream) return;

    remoteVideoRef.current.srcObject = remoteStream;
    remoteVideoRef.current
      .play()
      .then(() => {
        // console.log("🎥 Remote video playing successfully");
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Remote video play error ----- ", err);
        }
      });
  }, [remoteStream]);

  
  useEffect(() => {
    if (!socket || !isMediaReady) return;

    const userId = Math.random().toString(36).substr(2, 9);
    const userName = `User${Math.floor(Math.random() * 1000)}`;
    setCurrentUserId(userId);

    socket.emit("join-queue", { userId, userName, mode: "video" });
  }, [socket, isMediaReady]);

  useEffect(() => {
    if (!socket) return;

    const handleCallOffer = (data: any) => {
      handleOffer(data.offer);
    };

    const handleCallAnswer = (data: any) => {
      handleAnswer(data.answer);
    };

    const handleIceCandidateEvent = (data: any) => {
      handleIceCandidate(data.candidate);
    };

    const handlePeerDisconnected = () => {
      handlePeerDisconnection();
    };

    const handleCallEnded = () => {
      handlePeerDisconnection();
    };

    
    socket.on("call-offer", handleCallOffer);
    socket.on("call-answer", handleCallAnswer);
    socket.on("ice-candidate", handleIceCandidateEvent);
    socket.on("peer-disconnected", handlePeerDisconnected);
    socket.on("call-ended", handleCallEnded);

    return () => {
      socket.off("call-offer", handleCallOffer);
      socket.off("call-answer", handleCallAnswer);
      socket.off("ice-candidate", handleIceCandidateEvent);
      socket.off("peer-disconnected", handlePeerDisconnected);
      socket.off("call-ended", handleCallEnded);
    };
  }, [
    socket,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    handlePeerDisconnection,
  ]);

  
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (peerConnection.current) {
        peerConnection.current.close();
      }
    };
  }, []); 

  return {
    localStream,
    remoteStream,
    isConnected,
    error,
    mediaPermissions,
    localVideoRef,
    remoteVideoRef,
    initializePeerConnection,
    getUserMedia,
    stopMedia,
    toggleCamera,
    toggleMicrophone,
    isMatched,
    isMediaReady,
    setIsMediaReady,
    socket,
    startWebRTCConnection, 
    currentUserId,
  };
};
