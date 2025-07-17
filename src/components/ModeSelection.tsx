
import { Video, MessageCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ModeSelectionProps {
  onModeSelect: (mode: 'text' | 'video') => void;
  onBack: () => void;
}

const ModeSelection = ({ onModeSelect, onBack }: ModeSelectionProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center space-y-8 animate-fade-in">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full shadow-lg">
              <Users className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Choose Your Chat Mode
          </h1>
          <p className="text-lg text-gray-600">
            How would you like to connect with the others?
          </p>
        </div>

        {/* Mode Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Text Chat Mode */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <MessageCircle className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Text Chat</h3>
              <p className="text-gray-600 text-center">
                Connect through text messages only. Perfect for anonymous conversations.
              </p>
              <Button 
                onClick={() => onModeSelect('text')}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl"
              >
                Start Text Chat
              </Button>
            </div>
          </div>

          {/* Video Chat Mode */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-purple-100 p-4 rounded-full">
                <Video className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Video Chat</h3>
              <p className="text-gray-600 text-center">
                Face-to-face conversations with camera and microphone. More personal connections.
              </p>
              <Button 
                onClick={() => onModeSelect('video')}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl"
              >
                Start Video Chat
              </Button>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <Button 
          onClick={onBack}
          variant="outline"
          className="mt-6"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default ModeSelection;
