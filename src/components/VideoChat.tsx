"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  MessageSquare,
  Send,
  Loader,
  ArrowLeftIcon,
  Menu,
  RotateCcw,
  UserX,
  SmileIcon,
} from "lucide-react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useWebRTC } from "@/hooks/useWebRTC";
import config from "@/config/config";

interface VideoChatProps {
  onDisconnect: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  timestamp: Date;
}

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "waiting";

const VideoChat = ({ onDisconnect }: VideoChatProps) => {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");

  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [otherUser, setOtherUser] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [mediaInitialized, setMediaInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    localStream,
    remoteStream,
    isConnected,
    error,
    mediaPermissions,
    localVideoRef,
    remoteVideoRef,
    getUserMedia,
    toggleCamera,
    toggleMicrophone,
    stopMedia,
    isMatched,
    socket,
    startWebRTCConnection,
    currentUserId,
    isMediaReady,
    setIsMediaReady,
  } = useWebRTC();

  useEffect(() => {
    if (mediaInitialized) return;

    const initializeMedia = async () => {
      try {
        await getUserMedia(true, true);
        setIsMediaReady(true);
        setMediaInitialized(true);
      } catch (err) {
        setPermissionError(
          "Please allow camera and microphone access to use video chat"
        );
      }
    };

    initializeMedia();
  }, [mediaInitialized, getUserMedia]);

  useEffect(() => {
    if (!socket) return;

    const handleMatched = (data: any) => {
      setOtherUser(data.otherUser);
      setConnectionStatus("connected");
      startWebRTCConnection(data);
    };

    const handleMessage = (message: any) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message.text,
        sender: "other",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
    };

    const handleTyping = () => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    };

    const handleUserDisconnected = () => {
      setConnectionStatus("disconnected");
      setOtherUser(null);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: 'User disconnected. Click "Find New" to chat with someone else.',
          sender: "other",
          timestamp: new Date(),
        },
      ]);

      setTimeout(() => {
        socket.emit("find-new");
        setMessages([]);
        setConnectionStatus("connecting");
      }, 1000);
    };

    socket.on("peer-wants-find-new", () => {
      setConnectionStatus("connecting");
      setMessages([]);
      setOtherUser(null);
      socket.emit("peer-confirm-find-new");
    });

    socket.on("matched", handleMatched);
    socket.on("message", handleMessage);
    socket.on("typing", handleTyping);
    socket.on("user-disconnected", handleUserDisconnected);

    return () => {
      socket.off("matched", handleMatched);
      socket.off("message", handleMessage);
      socket.off("typing", handleTyping);
      socket.off("user-disconnected", handleUserDisconnected);
    };
  }, [localStream, socket, startWebRTCConnection]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      stopMedia();
    };
  }, []);

  const handleDisconnect = () => {
    if (socket) {
      socket.emit("end-call");
    }
    stopMedia();
    onDisconnect();
  };

  const handleEmojiPicker = () => {
    setEmojiPickerVisible(true);
    if (emojiPickerVisible) {
      inputRef.current?.focus();
    }
  };

  const handleFindNew = () => {
    if (socket) {
      socket.emit("find-new");
      setMessages([]);
      setOtherUser(null);
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !socket || !isMatched) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "me",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    socket.emit("send-message", { text: inputMessage });
    setInputMessage("");
  };

  function addEmoji(emoji: { native: string }) {
    setInputMessage((prev) => prev + emoji.native);
    setEmojiPickerVisible(false);
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    if (socket && isMatched) {
      socket.emit("typing");
    }
  };

  if (permissionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center space-y-6 bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <div className="text-red-500 mb-4">
            <VideoOff className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            Camera Access Required
          </h2>
          <p className="text-gray-600">{permissionError}</p>
          <div className="space-y-3">
            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              Try Again
            </Button>
            <Button
              onClick={onDisconnect}
              variant="outline"
              className="w-full bg-transparent"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 shadow-sm">
        <div className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
          {/* Left Section */}
          <div className="flex items-start md:items-center space-x-3 w-full">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg shrink-0">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">
                {config.APP_NAME} Video
              </h1>
              <div className="text-sm text-gray-600">
                {isConnected ? (
                  `Video connected with ${otherUser?.name || "someone"}`
                ) : isMatched ? (
                  <div className="flex items-center space-x-2">
                    <Loader className="w-4 h-4 animate-spin text-yellow-500" />
                    <span>
                      Setting up video call with{" "}
                      {`${otherUser?.name || "someone"}`}...
                    </span>
                  </div>
                ) : (
                  "Finding someone to vibe with..."
                )}
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="relative w-full md:w-auto">
            <div className="sm:hidden w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="w-full flex items-center justify-center bg-white hover:bg-gray-100 text-gray-700 border-gray-300"
              >
                <Menu className="w-4 h-4 mr-1" />
                Options
              </Button>

              {dropdownOpen && (
                <div className="mt-2 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!isMatched}
                    onClick={() => {
                      setShowChat(!showChat);
                      setDropdownOpen(false);
                    }}
                    className={`w-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 ${
                      showChat
                        ? "bg-blue-50 text-blue-600 border-blue-200"
                        : "bg-transparent"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Chat
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleDisconnect();
                      setDropdownOpen(false);
                    }}
                    className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 bg-transparent"
                  >
                    {connectionStatus === "disconnected" ? (
                      <ArrowLeftIcon className="w-4 h-4 mr-1" />
                    ) : (
                      <Phone className="w-4 h-4 mr-1" />
                    )}
                    {connectionStatus === "disconnected"
                      ? "Back to Home"
                      : connectionStatus === "connecting"
                      ? "Cancel"
                      : "Disconnect"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!isMatched}
                    onClick={() => {
                      handleFindNew();
                      setDropdownOpen(false);
                    }}
                    className="w-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 bg-transparent"
                  >
                    Find New
                  </Button>
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!isMatched}
                onClick={() => setShowChat(!showChat)}
                className={`hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 ${
                  showChat
                    ? "bg-blue-50 text-blue-600 border-blue-200"
                    : "bg-transparent"
                }`}
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Chat
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 bg-transparent"
              >
                {connectionStatus === "disconnected" ? (
                  <ArrowLeftIcon className="w-4 h-4 mr-1" />
                ) : (
                  <Phone className="w-4 h-4 mr-1" />
                )}
                {connectionStatus === "disconnected"
                  ? "Back to Home"
                  : connectionStatus === "connecting"
                  ? "Cancel"
                  : "Disconnect"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={!isMatched}
                onClick={handleFindNew}
                className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 bg-transparent"
              >
                Find New
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Video and Chat Area */}
      <div className="flex-1 p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          {/* Remote Video */}
          <div className="w-full max-w-2xl">
            <AspectRatio ratio={16 / 9}>
              <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-xl h-full">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {!remoteStream && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center text-white">
                      <div className="bg-gray-700 p-6 rounded-full mx-auto mb-4 w-24 h-24 flex items-center justify-center">
                        <Video className="w-12 h-12" />
                      </div>
                      <p className="text-lg">
                        {isMatched
                          ? `Connecting video with ${
                              otherUser?.name || "other person"
                            }...`
                          : "Waiting for other person..."}
                      </p>
                      {isMatched && (
                        <p className="text-sm text-gray-300 mt-2">
                          Setting up peer-to-peer connection...
                        </p>
                      )}
                    </div>
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
                  {otherUser?.name || "Other Person"}
                </div>
                {remoteStream && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-lg text-xs">
                    Connected
                  </div>
                )}
              </div>
            </AspectRatio>
          </div>

          {/* Local Video */}
          <div className="w-full max-w-lg">
            <AspectRatio ratio={16 / 9}>
              <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-xl h-full">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />
                {!isMediaReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center text-white">
                      <div className="bg-gray-700 p-6 rounded-full mx-auto mb-4 w-24 h-24 flex items-center justify-center">
                        <VideoOff className="w-12 h-12" />
                      </div>
                      <p>Setting up camera...</p>
                    </div>
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
                  You
                </div>
              </div>
            </AspectRatio>
          </div>

          {/* Controls */}
          {isMediaReady && (
            <div className="flex justify-center space-x-4 mt-4">
              <Button
                onClick={toggleMicrophone}
                size="lg"
                variant={
                  mediaPermissions.microphone ? "default" : "destructive"
                }
                className="rounded-full w-14 h-14 p-0"
              >
                {mediaPermissions.microphone ? (
                  <Mic className="w-6 h-6" />
                ) : (
                  <MicOff className="w-6 h-6" />
                )}
              </Button>

              <Button
                onClick={toggleCamera}
                size="lg"
                variant={mediaPermissions.camera ? "default" : "destructive"}
                className="rounded-full w-14 h-14 p-0"
              >
                {mediaPermissions.camera ? (
                  <Video className="w-6 h-6" />
                ) : (
                  <VideoOff className="w-6 h-6" />
                )}
              </Button>

              <Button
                onClick={handleDisconnect}
                size="lg"
                variant="destructive"
                className="rounded-full w-14 h-14 p-0"
              >
                <Phone className="w-6 h-6" />
              </Button>
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-full md:w-96 bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 flex flex-col overflow-hidden max-h-[80vh]">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
              <h3 className="font-semibold flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Chat with {otherUser?.name || "Other Person"}
              </h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar max-h-[50vh] md:max-h-[60vh]">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Start a conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "me" ? "justify-end" : "justify-start"
                    } animate-fade-in`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-2xl shadow-sm text-sm ${
                        message.sender === "me"
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p>{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === "me"
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}

              {isTyping && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-2xl shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4 relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-blue-500 to-purple-600"></div>
              <div className="flex space-x-2">
              {emojiPickerVisible && (
                  <div className="absolute bottom-full left-0 z-50 w-[300px]">
                    <Picker
                      data={data}
                      className="w-full"
                      onClickOutside={() => setEmojiPickerVisible(false)}
                      onEmojiSelect={addEmoji}
                    />
                  </div>
                )}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEmojiPicker();
                  }}
                  className="bg-white text-gray-600 shadow-md hover:bg-gray-100 px-4 rounded-xl"
                >
                  <SmileIcon size={5} className="w-4 h-4" />
                </Button>
                <Input
                ref={inputRef}
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  disabled={!isMatched}
                  className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || !isMatched}
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 rounded-xl"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mx-4 mb-4">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default VideoChat;
