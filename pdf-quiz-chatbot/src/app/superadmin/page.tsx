"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";


const handleDeleteAccount = async (userId) => {
  const response = await fetch("/api/superadmin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "deleteAccount", payload: { userId } }),
  });
  const result = await response.json();
  alert(result.success ? "Account deleted successfully" : "Error deleting account");
};

const handleViewFeedback = async () => {
  const response = await fetch("/api/superadmin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "viewFeedback" }),
  });
  const feedback = await response.json();
  console.log("Feedback:", feedback);
};

const handleAddSuperAdmin = async (email) => {
  const response = await fetch("/api/superadmin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "addSuperAdmin", payload: { email } }),
  });
  const result = await response.json();
  alert(result.success ? "SuperAdmin added successfully" : "Error adding SuperAdmin");
};

const SuperAdminPage = () => {
  const [newSuperAdminEmail, setNewSuperAdminEmail] = useState("");

  return (
    <main className="relative flex flex-col min-h-screen bg-gradient-to-br animate-gradient-move from-blue-700 via-purple-700 to-pink-700 bg-[length:200%_200%]">
      {/* Navbar mit UserAccountNav */}
      <Navbar /> {/* Hier wird die Navbar eingebunden */}

      <div className="flex flex-1 items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md shadow-lg border border-white/20 rounded-2xl p-8 max-w-4xl w-full text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Willkommen to the SuperAdmin site
          </h2>
          <p className="mt-2 text-lg text-white/80">
            Manage users, view feedback, and add new SuperAdmins.
          </p>

          <div className="mt-6 space-y-4">
            {/* Delete Account */}
            <button
              onClick={() => handleDeleteAccount(1)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow"
            >
              Delete Account
            </button>

            {/* View Feedback */}
            <button
              onClick={handleViewFeedback}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow"
            >
              View Feedback
            </button>

            {/* Add New SuperAdmin */}
            <div className="space-y-2">
              <input
                type="email"
                value={newSuperAdminEmail}
                onChange={(e) => setNewSuperAdminEmail(e.target.value)}
                placeholder="Enter email for new SuperAdmin"
                className="w-full px-4 py-2 rounded border border-gray-300"
              />
              <button
                onClick={() => handleAddSuperAdmin(newSuperAdminEmail)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow"
              >
                Add New SuperAdmin
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SuperAdminPage;