"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { signOut } from "next-auth/react";
import { Home, Settings, LogOut, Image, User, UploadCloud } from "lucide-react";

type UserProfile = {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  createdAt?: string;
  isPro?: boolean;
};

const sidebarItems = [
  { title: "Dashboard", icon: Home, id: "dashboard" },
  { title: "Account", icon: User, id: "account" },
  { title: "Change Profile Picture", icon: Image, id: "profile" },
  { title: "Settings", icon: Settings, id: "settings" },
];

const UserProfilePage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOption, setSelectedOption] = useState<string>("dashboard");
  const [editMode, setEditMode] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [image, setImage] = useState<string>("/default-avatar.png");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Fetch user profile
  useEffect(() => {
    if (!userId) {
      console.warn("User ID not available yet");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/userprofile/${userId}`);
        const userData = response.data;
        setUser(userData);
        setName(userData.name || "");
        setImage(userData.image || "/default-avatar.png");
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  // Handle profile image upload
  const handleSave = async () => {
    try {
      let uploadedImagePath = image;

      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const uploadResponse = await axios.post("/api/images", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        uploadedImagePath = uploadResponse.data.filePaths[0];
      }

      await axios.put(`/api/userprofile/${userId}`, { image: uploadedImagePath });

      setImage(uploadedImagePath);
      setUser((prev) => (prev ? { ...prev, image: uploadedImagePath } : null));
      setEditMode(false);

      console.log("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  return (
    <main className="flex min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-white/10 backdrop-blur-lg shadow-lg p-4 rounded-r-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">User Menu</h1>
        </div>
        <ul className="space-y-4">
          {sidebarItems.map((item) => (
            <li key={item.id}>
              <Button
                onClick={() => setSelectedOption(item.id)}
                className={`w-full flex items-center gap-2 justify-start ${
                  selectedOption === item.id ? "bg-blue-500" : "bg-transparent"
                } hover:bg-blue-400 transition`}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Button>
            </li>
          ))}
          {/* Logout */}
          <li>
            <Button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-2 justify-start bg-red-500 hover:bg-red-600 transition"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <section className="flex-1 flex items-center justify-center p-8">
        {loading ? (
          <p className="text-gray-200">Loading...</p>
        ) : selectedOption === "profile" ? (
          <Card className="w-full max-w-3xl bg-white/10 backdrop-blur-lg shadow-lg rounded-2xl p-8">
            <CardHeader className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32">
                <img
                  src={image}
                  alt="Profile"
                  className="w-full h-full rounded-full border-4 border-white/50"
                  onError={(e) => (e.currentTarget.src = "/default-avatar.png")} // Fallback to default avatar
                />
              </div>
              <CardTitle className="text-2xl font-bold">Change Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
              />
              <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600">
                <UploadCloud className="mr-2 h-5 w-5" /> Upload and Save
              </Button>
            </CardContent>
          </Card>
        ) : selectedOption === "account" && user ? (
          <Card className="w-full max-w-3xl bg-white/10 backdrop-blur-lg shadow-lg rounded-2xl p-8">
            <CardHeader className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32">
                <img
                  src={image}
                  alt="Profile"
                  className="w-full h-full rounded-full border-4 border-white/50"
                />
              </div>
              <CardTitle className="text-2xl font-bold">{user.name}</CardTitle>
              <p className="text-gray-300">Email: {user.email}</p>
              <p className="text-sm text-gray-400">
                Member since: {new Date(user.createdAt!).toLocaleDateString()}
              </p>
            </CardHeader>
          </Card>
        ) : (
          <p className="text-gray-200 text-lg">Select an option from the menu.</p>
        )}
      </section>
    </main>
  );
};

export default UserProfilePage;
