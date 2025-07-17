"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  MessageSquare,
  UserX,
  RotateCcw,
  Loader,
  ArrowLeftFromLine,
  ArrowLeftIcon,
  Smile,
  SmileIcon,
  Menu,
} from "lucide-react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSocket } from "@/hooks/useSocket";
import config from "@/config/config.js";
import { toast } from "sonner";
import "../App.css";

interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  timestamp: Date;
}

interface ChatInterfaceProps {
  onDisconnect: () => void;
}

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "waiting";

const ChatInterface = ({ onDisconnect }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [hasMatched, setHasMatched] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [isTyping, setIsTyping] = useState(false);
  const [otherUser, setOtherUser] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const socket = useSocket(config.SERVER_URL);

  useEffect(() => {
    if (!socket) return;

    const userId = Math.random().toString(36).substr(2, 9);
    const userName = `User${Math.floor(Math.random() * 1000)}`;

    socket.emit("join-queue", {
      userId,
      userName,
      mode: "text",
    });

    socket.on("matched", (data) => {
      if (hasMatched) return;
      setHasMatched(true);
      setOtherUser(data.otherUser);
      setConnectionStatus("connected");
      setTimeout(() => {
        if (data.icebreaker) {
          toast.info(`Icebreaker for you:`, {
            description: data.icebreaker,
            descriptionClassName: "text-black",
            duration: 8000,
            dismissible: true,
            position: "top-center",
            style: {
              fontSize: "1rem",
              backgroundColor: "#f0f0f0",
              color: "#2563eb",
            },
            className: "font-semibold shadow-lg",
          });
        }
      }, 5000);
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: `You are now connected with ${data.otherUser.name}!`,
        sender: "other",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    });

    socket.on("message", (message) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message.text,
        sender: "other",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.on("user-disconnected", () => {
      setConnectionStatus("disconnected");
      setHasMatched(false);
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
    });

    socket.on("peer-wants-find-new", () => {
      setConnectionStatus("connecting");
      setMessages([]);
      setOtherUser(null);
      socket.emit("peer-confirm-find-new");
    });

    socket.on("typing", () => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    });

    return () => {
      socket.off("matched");
      socket.off("message");
      socket.off("user-disconnected");
      socket.off("typing");
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (connectionStatus === "connected") {
      inputRef.current?.focus();
    }
  }, [connectionStatus]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || connectionStatus !== "connected" || !socket)
      return;

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  function addEmoji(emoji: { native: string }) {
    setInputMessage((prev) => prev + emoji.native);
    setEmojiPickerVisible(false);
  }

  const handleEmojiPicker = () => {
    setEmojiPickerVisible(true);
    if (emojiPickerVisible) {
      inputRef.current?.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    if (socket && connectionStatus === "connected") {
      socket.emit("typing");
    }
  };

  const handleFindNew = () => {
    if (socket) {
      socket.emit("find-new");
      setHasMatched(false);
      setMessages([]);
      setConnectionStatus("connecting");
      setOtherUser(null);
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connecting":
        return "Looking for someone to vibe with…";
      case "connected":
        return `You are now chatting with ${
          otherUser?.name || "a college mate"
        }!`;
      case "disconnected":
        return "User has disconnected";
      case "waiting":
        return "Looking for someone new...";
      default:
        return "";
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connecting":
      case "waiting":
        return "text-yellow-600";
      case "connected":
        return "text-green-600";
      case "disconnected":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0 w-full">
          {/* Left Section */}
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg shrink-0">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">
                {config.APP_NAME} Text
              </h1>
              <div className="flex items-center space-x-2">
                {connectionStatus === "connecting" && (
                  <Loader className="w-4 h-4 animate-spin text-yellow-500" />
                )}
                <p className={`text-sm font-medium ${getStatusColor()}`}>
                  {getStatusText()}
                </p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="hidden sm:flex flex-wrap sm:flex-nowrap space-x-0 sm:space-x-2 space-y-2 sm:space-y-0 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onDisconnect}
              className="w-full sm:w-auto hover:bg-red-50 hover:text-red-600 hover:border-red-200 bg-transparent flex items-center justify-center"
            >
              {connectionStatus === "disconnected" ? (
                <ArrowLeftIcon />
              ) : (
                <UserX className="w-4 h-4 mr-1" />
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
              onClick={handleFindNew}
              disabled={connectionStatus === "connecting"}
              className="w-full sm:w-auto hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 bg-transparent flex items-center justify-center"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Find New
            </Button>
          </div>

          {/* Hamburger Menu for Mobile */}
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
                  onClick={onDisconnect}
                  className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 bg-transparent flex items-center justify-center"
                >
                  {connectionStatus === "disconnected" ? (
                    <ArrowLeftIcon className="w-4 h-4 mr-1" />
                  ) : (
                    <UserX className="w-4 h-4 mr-1" />
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
                  onClick={handleFindNew}
                  disabled={connectionStatus === "connecting"}
                  className="w-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 bg-transparent flex items-center justify-center"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Find New
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-4 overflow-hidden flex flex-col">
        <div
          className="flex-1 bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 flex flex-col overflow-hidden"
          style={{ maxHeight: "80vh" }}
        >
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {connectionStatus === "connecting" ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-full animate-pulse">
                  <MessageSquare className="w-12 h-12 text-white" />
                </div>
                <p className="text-lg font-medium text-gray-600">
                  Finding you a chat buddy...
                </p>
                <div className="flex space-x-1">
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "me" ? "justify-end" : "justify-start"
                    } animate-fade-in`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                        message.sender === "me"
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
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
                ))}

                {isTyping && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-gray-100 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm">
                      <div className="flex space-x-1">
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          {connectionStatus === "connected" && (
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
                  placeholder="Type your message..."
                  className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 rounded-xl"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
