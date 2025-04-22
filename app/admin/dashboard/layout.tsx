"use client";

import { SidebarNav } from "@/components/sidebar-nav";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{
    id: number;
    name: string;
    email: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          
          if (userData.role !== "admin") {
            toast.error("Access denied: Admin privileges required");
            router.push("/login");
          }
        } else {
          router.push("/admin/login");
        }
      } catch (error) {
        toast.error("Authentication failed");
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[250px_1fr]">
      {/* Sidebar */}
      <div className="hidden border-r bg-gray-100/40 md:block dark:bg-gray-800/40">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4">
            <div className="flex items-center gap-2 font-semibold text-lg">
              <ShieldCheck className="h-6 w-6 text-green-500" />
              <span>Admin Portal</span>
            </div>
          </div>
          <div className="flex-1 overflow-auto py-2 px-4">
            <SidebarNav userRole="admin" />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-6 w-6 text-green-500" />
            <span>Admin Portal</span>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}