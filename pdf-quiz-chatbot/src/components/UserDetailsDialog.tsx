"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  Clock,
} from "lucide-react";

type Game = {
  id: string;
  topic?: string; // Optional - not sent from API for privacy
  score?: number | null; // Optional - not sent from API for privacy
  timeStarted: string;
  timeEnded: string | null;
};

type User = {
  id: string;
  name: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  role: string;
  createdAt: string;
  totalPoints: number;
  quizzesTaken: number;
  lastActive: string;
  games: Game[];
  _count: {
    games: number;
    chats: number;
  };
};

interface UserDetailsDialogProps {
  user: User | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateProfile: (userId: string) => Promise<void>;
  editForm: {
    firstName: string;
    lastName: string;
    bio: string;
  };
  setEditForm: React.Dispatch<React.SetStateAction<{
    firstName: string;
    lastName: string;
    bio: string;
  }>>;
}

export function UserDetailsDialog({
  user,
  isOpen,
  onOpenChange,
  onUpdateProfile,
  editForm,
  setEditForm,
}: UserDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'activity'>('profile');

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-[90vw] max-w-lg p-0 gap-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl overflow-hidden">
        <DialogHeader className="p-4 sm:p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20">
          <DialogTitle className="text-xl sm:text-2xl font-bold">
            {user.name || 'User Details'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 px-4">
          {['profile', 'activity'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <ScrollArea className="flex-1 p-4 sm:p-6 max-h-[60vh]">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="firstName">First Name</label>
                  <Input
                    id="firstName"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="bg-white/50 dark:bg-gray-800/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="lastName">Last Name</label>
                  <Input
                    id="lastName"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="bg-white/50 dark:bg-gray-800/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="bio">Bio</label>
                <Textarea
                  id="bio"
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  className="bg-white/50 dark:bg-gray-800/50"
                />
              </div>
              <Button 
                onClick={() => onUpdateProfile(user.id)}
                className="w-full sm:w-auto"
              >
                Save Changes
              </Button>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white/50 dark:bg-gray-800/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <p className="text-sm font-medium">Games</p>
                    </div>
                    <p className="text-2xl font-bold mt-2">{user._count.games}</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/50 dark:bg-gray-800/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      <p className="text-sm font-medium">Quizzes</p>
                    </div>
                    <p className="text-2xl font-bold mt-2">{user.quizzesTaken}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 