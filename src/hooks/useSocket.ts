"use client"

import { useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"

interface ServerToClientEvents {
  connected: () => void
  disconnected: () => void
  matched: (data: { roomId: string; otherUser: { id: string; name: string } }) => void
  "user-joined": (user: { id: string; name: string }) => void
  "user-left": (user: { id: string; name: string }) => void
  "user-disconnected": () => void
  message: (message: { text: string; from: string }) => void
  typing: () => void
  "room-full": () => void
  "call-offer": (data: { from: string; offer: RTCSessionDescriptionInit }) => void
  "call-answer": (data: { from: string; answer: RTCSessionDescriptionInit }) => void
  "ice-candidate": (data: { from: string; candidate: RTCIceCandidateInit }) => void
  "call-ended": () => void
  "peer-disconnected": () => void
  "peer-wants-find-new": () => void
}

interface ClientToServerEvents {
  "join-queue": (data: { userId: string; userName: string; mode: "text" | "video" }) => void
  "send-message": (message: { text: string }) => void
  typing: () => void
  "find-new": () => void
  "call-offer": (data: { offer: RTCSessionDescriptionInit }) => void
  "call-answer": (data: { answer: RTCSessionDescriptionInit }) => void
  "ice-candidate": (data: { candidate: RTCIceCandidateInit }) => void
  "end-call": () => void
  disconnect: () => void
  "peer-confirm-find-new":() => void

}

export const useSocket = (serverUrl: string): Socket<ServerToClientEvents, ClientToServerEvents> | null => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)

  useEffect(() => {
    const newSocket: Socket<ServerToClientEvents, ClientToServerEvents> = io(serverUrl, {
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: true,
    })

    newSocket.on("connect", () => {
      setSocket(newSocket)
    })

    newSocket.on("disconnect", (reason) => {
      setSocket(null)
    })

    newSocket.on("connect_error", (error) => {
    })

    newSocket.on("room-full", () => {
      alert("This chat room is full. Only 2 users are allowed.")
      window.location.reload()
    })

    return () => {
      newSocket.close()
    }
  }, [serverUrl])

  return socket
}
