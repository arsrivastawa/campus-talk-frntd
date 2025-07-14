import { useState } from "react";
import LandingPage from "@/components/LandingPage";
import ModeSelection from "@/components/ModeSelection";
import ChatInterface from "@/components/ChatInterface";
import VideoChat from "@/components/VideoChat";

type AppState = "landing" | "mode-selection" | "text-chat" | "video-chat";
type ChatMode = "text" | "video";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("landing");
  const [chatMode, setChatMode] = useState<ChatMode>("text");

  const handleStartChat = () => {
    setAppState("mode-selection");
  };

  const handleModeSelect = (mode: ChatMode) => {
    setChatMode(mode);
    if (mode === "text") {
      setAppState("text-chat");
    } else {
      setAppState("video-chat");
    }
  };

  const handleDisconnect = () => {
    setAppState("landing");
  };

  const handleFindNew = () => {
    // For now, we'll simulate finding a new person by reloading the chat
    setAppState("mode-selection");
    setTimeout(() => {
      if (chatMode === "text") {
        setAppState("text-chat");
      } else {
        setAppState("video-chat");
      }
    }, 500);
  };

  const handleBackToLanding = () => {
    setAppState("landing");
  };

  return (
    <div className="min-h-screen">
      {appState === "landing" && <LandingPage onStartChat={handleStartChat} />}

      {appState === "mode-selection" && (
        <ModeSelection
          onModeSelect={handleModeSelect}
          onBack={handleBackToLanding}
        />
      )}

      {appState === "text-chat" && (
        <ChatInterface
          onDisconnect={handleDisconnect}
          onFindNew={handleFindNew}
        />
      )}

      {appState === "video-chat" && (
        <VideoChat onDisconnect={handleDisconnect} onFindNew={handleFindNew} />
      )}
    </div>
  );
};

export default Index;
