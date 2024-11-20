"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function TestPage() {
  const router = useRouter();

  const handleRegister = () => {
    console.log("Navigiere zur Registrierungsseite...");
    router.push("/auth/register");
  };

  return (
    <div>
      <h1>Test Navigation</h1>
      <button onClick={handleRegister}>Zu Register navigieren</button>
    </div>
  );
}
