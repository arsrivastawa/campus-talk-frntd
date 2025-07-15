import { useState } from "react";
import LandingPage from "@/components/LandingPage";
import ModeSelection from "@/components/ModeSelection";
import ChatInterface from "@/components/ChatInterface";
import VideoChat from "@/components/VideoChat";
import { toast } from "sonner";

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
    toast.success("Disconnected from chat", { position: "top-center",style: { backgroundColor: "#f0f0f0", color: "#2563eb" } });
    setAppState("landing");
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
        />
      )}

      {appState === "video-chat" && (
        <VideoChat onDisconnect={handleDisconnect}/>
      )}
    </div>
  );
};

export default Index;
