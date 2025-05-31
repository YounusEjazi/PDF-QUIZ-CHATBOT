"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  Trash2, 
  Shield, 
  Eye, 
  Activity, 
  MessageSquare, 
  Star,
  Users,
  MessageCircle,
  BarChart3,
  Clock
} from "lucide-react";

type Game = {
  id: string;
  topic: string;
  score: number | null;
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

type Feedback = {
  id: string;
  content: string;
  rating: number;
  category: string;
  createdAt: string;
  userId: string | null;
  userEmail: string | null;
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
};

export function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    bio: "",
  });

  useEffect(() => {
    fetchUsers();
    fetchFeedback();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    try {
      const response = await fetch("/api/feedback");
      if (!response.ok) throw new Error("Failed to fetch feedback");
      const data = await response.json();
      setFeedback(data);
    } catch (error) {
      toast.error("Failed to load feedback");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete user");

      toast.success("User deleted successfully");
      setUsers(users.filter(user => user.id !== userId));
      setSelectedUser(null);
      setIsViewingDetails(false);
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    try {
      setIsUpdatingRole(true);
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!response.ok) throw new Error("Failed to update role");

      const updatedUser = await response.json();
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: updatedUser.role } : user
      ));
      toast.success("User role updated successfully");
    } catch (error) {
      toast.error("Failed to update user role");
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleUpdateProfile = async (userId: string) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...editForm }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const updatedUser = await response.json();
      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...updatedUser } : user
      ));
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const openUserDetails = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      bio: user.bio || "",
    });
    setIsViewingDetails(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 sm:px-0">
        <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <h3 className="text-2xl font-bold mt-2">{users.length}</h3>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Feedback</p>
                <h3 className="text-2xl font-bold mt-2">{feedback.length}</h3>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Today</p>
                <h3 className="text-2xl font-bold mt-2">
                  {users.filter(u => new Date(u.lastActive).toDateString() === new Date().toDateString()).length}
                </h3>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Rating</p>
                <h3 className="text-2xl font-bold mt-2">
                  {feedback.length > 0 
                    ? (feedback.reduce((acc, f) => acc + f.rating, 0) / feedback.length).toFixed(1)
                    : "N/A"}
                </h3>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200 dark:border-gray-700 shadow-lg mx-4 sm:mx-0">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-4">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="feedback" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="inline">Feedback</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <div className="rounded-lg border bg-card">
                <ScrollArea className="h-[500px] sm:h-[600px]">
                  <div className="min-w-[600px]">
                    <Table>
                      <TableHeader className="sticky top-0 bg-card z-10">
                        <TableRow>
                          <TableHead className="w-[200px]">User</TableHead>
                          <TableHead className="hidden md:table-cell">Role</TableHead>
                          <TableHead className="hidden lg:table-cell">Joined</TableHead>
                          <TableHead className="hidden sm:table-cell">Points</TableHead>
                          <TableHead className="hidden md:table-cell">Quizzes</TableHead>
                          <TableHead className="hidden lg:table-cell">Last Active</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                  {user.name?.[0]?.toUpperCase() || "U"}
                                </div>
                                <div>
                                  <p className="font-medium">{user.name || "N/A"}</p>
                                  <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Select
                                defaultValue={user.role}
                                onValueChange={(value) => handleRoleUpdate(user.id, value)}
                                disabled={isUpdatingRole}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="USER">User</SelectItem>
                                  <SelectItem value="MODERATOR">Moderator</SelectItem>
                                  <SelectItem value="ADMIN">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">{user.totalPoints}</TableCell>
                            <TableCell className="hidden md:table-cell">{user.quizzesTaken}</TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {new Date(user.lastActive).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => openUserDetails(user)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                                      onClick={() => setSelectedUser(user)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Delete User</DialogTitle>
                                      <DialogDescription>
                                        Are you sure you want to delete this user? This action cannot be undone.
                                        All their data, including quiz history and progress, will be permanently deleted.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                      <Button
                                        variant="outline"
                                        onClick={() => setSelectedUser(null)}
                                        disabled={isDeleting}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        onClick={() => selectedUser && handleDeleteUser(selectedUser.id)}
                                        disabled={isDeleting}
                                      >
                                        {isDeleting ? "Deleting..." : "Delete User"}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="feedback">
              <div className="rounded-lg border bg-card">
                <ScrollArea className="h-[500px] sm:h-[600px]">
                  <div className="min-w-[600px]">
                    <Table>
                      <TableHeader className="sticky top-0 bg-card z-10">
                        <TableRow>
                          <TableHead className="w-[200px]">User</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="w-[100px]">Rating</TableHead>
                          <TableHead>Feedback</TableHead>
                          <TableHead className="hidden sm:table-cell">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {feedback.map((item) => (
                          <TableRow 
                            key={item.id} 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => setSelectedFeedback(item)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                  {item.user?.name?.[0]?.toUpperCase() || "A"}
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {item.user?.name || "Anonymous"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.user?.email || item.userEmail || "No email"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                                {item.category}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, index) => (
                                  <Star
                                    key={index}
                                    className={`w-4 h-4 ${
                                      index < item.rating
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-gray-300 dark:text-gray-600"
                                    }`}
                                  />
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="line-clamp-2 max-w-[200px] sm:max-w-none">{item.content}</p>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Feedback Dialog */}
      <Dialog open={!!selectedFeedback} onOpenChange={(open) => !open && setSelectedFeedback(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogDescription>
              Submitted on {selectedFeedback && new Date(selectedFeedback.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {selectedFeedback.user?.name?.[0]?.toUpperCase() || "A"}
                </div>
                <div>
                  <p className="font-medium">{selectedFeedback.user?.name || "Anonymous"}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedFeedback.user?.email || selectedFeedback.userEmail || "No email"}
                  </p>
                </div>
              </div>

              {/* Rating and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Rating</p>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`w-5 h-5 ${
                          index < selectedFeedback.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                    {selectedFeedback.category}
                  </span>
                </div>
              </div>

              {/* Feedback Content */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Feedback</p>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm whitespace-pre-wrap">{selectedFeedback.content}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={isViewingDetails} onOpenChange={setIsViewingDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-6">
              <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Edit user's profile details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="firstName">First Name</label>
                      <Input
                        id="firstName"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName">Last Name</label>
                      <Input
                        id="lastName"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="bio">Bio</label>
                    <Textarea
                      id="bio"
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    />
                  </div>
                  <Button onClick={() => handleUpdateProfile(selectedUser.id)}>
                    Save Changes
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Activity Overview</CardTitle>
                  <CardDescription>User's activity statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium">Games</span>
                      </div>
                      <p className="text-2xl font-bold mt-2">{selectedUser._count.games}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium">Chats</span>
                      </div>
                      <p className="text-2xl font-bold mt-2">{selectedUser._count.chats}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium">Points</span>
                      </div>
                      <p className="text-2xl font-bold mt-2">{selectedUser.totalPoints}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        <span className="text-sm font-medium">Quizzes</span>
                      </div>
                      <p className="text-2xl font-bold mt-2">{selectedUser.quizzesTaken}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Recent Games</CardTitle>
                  <CardDescription>Last 5 games played</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedUser.games.map((game) => (
                      <div key={game.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                        <div>
                          <p className="font-medium">{game.topic}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(game.timeStarted).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{game.score ? `${game.score}%` : 'Incomplete'}</p>
                          <p className="text-sm text-muted-foreground">
                            {game.timeEnded ? 
                              `${Math.round((new Date(game.timeEnded).getTime() - new Date(game.timeStarted).getTime()) / 60000)}min` 
                              : 'In Progress'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 