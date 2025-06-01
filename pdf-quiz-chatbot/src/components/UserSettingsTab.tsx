import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Save, X, Trash2, Upload } from "lucide-react";

type UserSettingsTabProps = {
  user: {
    id: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    bio: string | null;
    image: string | null;
  };
};

export function UserSettingsTab({ user }: UserSettingsTabProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    bio: user.bio || "",
    email: user.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileUpdate = async () => {
    try {
      // Validate password fields if they're being updated
      if (profileData.newPassword || profileData.currentPassword || profileData.confirmPassword) {
        if (!profileData.currentPassword) {
          toast.error("Current password is required");
          return;
        }
        if (profileData.newPassword !== profileData.confirmPassword) {
          toast.error("New passwords do not match");
          return;
        }
      }

      const response = await fetch(`/api/userprofile/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          bio: profileData.bio,
          ...(profileData.newPassword ? {
            currentPassword: profileData.currentPassword,
            newPassword: profileData.newPassword,
          } : {}),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      toast.success("Profile updated successfully");
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfileData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      bio: user.bio || "",
      email: user.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleProfileDelete = async () => {
    try {
      setIsDeletingLoading(true);
      const response = await fetch(`/api/userprofile/${user.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete profile");

      toast.success("Profile deleted successfully");
      
      // Sign out the user and redirect to home page
      await signOut({ 
        redirect: false // We'll handle the redirect ourselves
      });
      
      // Redirect to home page
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete profile");
      setIsDeletingLoading(false);
    }
  };

  return (
    <div className="space-y-4 px-2 sm:px-4 max-w-3xl mx-auto">
      {/* Profile Information */}
      <Card className="shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </div>
            <Button
              variant={isEditing ? "ghost" : "default"}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <X className="w-4 h-4 mr-2" />
              ) : (
                <Edit className="w-4 h-4 mr-2" />
              )}
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
              <Input
                id="firstName"
                value={profileData.firstName}
                onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                disabled={!isEditing}
                className="max-w-full"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
              <Input
                id="lastName"
                value={profileData.lastName}
                onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                disabled={!isEditing}
                className="max-w-full"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input
              id="email"
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              disabled={!isEditing}
              className="max-w-full"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium">Bio</label>
            <Textarea
              id="bio"
              value={profileData.bio}
              onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
              disabled={!isEditing}
              className="max-w-full resize-none"
              rows={3}
            />
          </div>
          {isEditing && (
            <div className="flex justify-end">
              <Button onClick={handleProfileUpdate}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Change */}
      {isEditing && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="text-sm font-medium">Current Password</label>
              <Input
                id="currentPassword"
                type="password"
                value={profileData.currentPassword}
                onChange={(e) => setProfileData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="max-w-full"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">New Password</label>
              <Input
                id="newPassword"
                type="password"
                value={profileData.newPassword}
                onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="max-w-full"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</label>
              <Input
                id="confirmPassword"
                type="password"
                value={profileData.confirmPassword}
                onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="max-w-full"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleProfileUpdate}>
                Update Password
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Picture */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Update your profile picture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <img
              src={user.image || "https://www.gravatar.com/avatar/?d=mp"}
              alt="Profile"
              className="w-24 h-24 rounded-full"
            />
            <Button variant="outline" className="w-full sm:w-auto">
              <Upload className="w-4 h-4 mr-2" />
              Upload New Picture
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[90%] max-w-md">
              <DialogHeader>
                <DialogTitle>Delete Account</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete your account? This action cannot be undone.
                  All your data, including quiz history and progress, will be permanently deleted.
                  You will be signed out and redirected to the home page.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeleting(false)}
                  disabled={isDeletingLoading}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleProfileDelete}
                  disabled={isDeletingLoading}
                  className="w-full sm:w-auto"
                >
                  {isDeletingLoading ? "Deleting..." : "Delete Account"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
} 