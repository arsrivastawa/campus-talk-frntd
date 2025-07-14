
import { MessageCircle, Users, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingPageProps {
  onStartChat: () => void;
}

const LandingPage = ({ onStartChat }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center space-y-8 animate-fade-in">
        {/* Logo/Header */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full shadow-lg">
              <MessageCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            CampusTalk
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Chat and connect with fellow college mates!
          </p>
        </div>

        {/* Welcome Message */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Welcome to CampusTalk 🎓
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Perfect for freshers and college students! Connect anonymously with fellow students, 
            break the ice, and make new friends on campus. Get randomly matched for one-on-one 
            conversations and discover your college community.
          </p>
          
          {/* Features */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="flex flex-col items-center p-4 bg-blue-50 rounded-xl">
              <Users className="w-8 h-8 text-blue-500 mb-2" />
              <span className="text-sm font-medium text-blue-700">Random Matching</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-purple-50 rounded-xl">
              <MessageCircle className="w-8 h-8 text-purple-500 mb-2" />
              <span className="text-sm font-medium text-purple-700">Anonymous Chat</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-green-50 rounded-xl">
              <Heart className="w-8 h-8 text-green-500 mb-2" />
              <span className="text-sm font-medium text-green-700">Campus Bonding</span>
            </div>
          </div>

          <Button 
            onClick={onStartChat}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Start Chatting 🚀
          </Button>
        </div>

        {/* Footer */}
        <p className="text-sm text-gray-500">
          Safe, anonymous, and perfect for campus connections
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
