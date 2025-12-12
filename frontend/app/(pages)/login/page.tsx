"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const LoginSchema = z.object({
    username: z.string(),
    password: z.string()
});


type FormValues = z.infer<typeof LoginSchema>;

interface ApiResponse {
    [key: string]: any;
}

export default function Login() {
    const [loading, setLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const { login } = useAuth();
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
    });

    const onSubmit = async (data: FormValues): Promise<void> => {
        try {
            setLoading(true);
            const res = await axios.post<ApiResponse>(`${process.env.NEXT_PUBLIC_API_URL}/login`, data);

            login(res.data.accessToken, res.data.refreshToken);
            console.log("Login successful");
            setErrorMessage(null);

            router.push("/dashboard");
        } catch (error: any) {
            console.log(error);
            setErrorMessage(error.response?.data?.message || "Login failed!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-800">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label>Username</Label>
                            <Input
                                type="text"

                                {...register("username")}
                            />
                            {errors.username && (
                                <p className="text-sm text-red-500">{errors.username.message}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <Label>Password</Label>
                            <Input
                                type="password"

                                {...register("password")}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Button */}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Login"
                            )}
                        </Button>
                    </form>
                </CardContent>
                {errorMessage && (
                    <p className="text-center text-sm text-red-500 mb-4">{errorMessage}</p>
                )}

                <CardFooter className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Don’t have an account? <Link href="/signup" className="text-blue-500 ml-2"> Sign up</Link>
                </CardFooter>
            </Card>
        </div>
    );
}
