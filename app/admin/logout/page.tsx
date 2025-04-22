"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AdminLogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      try {
        const response = await fetch("/api/auth/logout");
        
        if (!response.ok) {
          throw new Error("Failed to log out");
        }
        
        toast.success("Logged out successfully");
        router.push("/");
      } catch (error) {
        console.error("Logout error:", error);
        toast.error("Failed to log out");
        router.push("/");
      }
    };

    logout();
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
        <p className="text-lg">Logging out...</p>
      </div>
    </div>
  );
}