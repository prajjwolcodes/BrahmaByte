"use client";

import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function LogoutButton() {
    const { logout, isLoggedIn } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    const handleLogout = () => {
        queryClient.clear();
        logout();
        // Navigate to login
        router.push("/login");
    };

    if (!isLoggedIn) return null;

    return (
        <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
        >
            <LogOut className="w-4 h-4" />
            Logout
        </Button>
    );
}
