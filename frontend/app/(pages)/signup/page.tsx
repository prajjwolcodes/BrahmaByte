"use client";

import { useForm } from "react-hook-form";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";


type FormValues = z.infer<typeof FormSchema>;

interface ApiResponse {
    [key: string]: any;
}

const FormSchema = z.object({
    username: z.string().min(2, "username is required"),
    password: z.string().min(6, "Enter a valid password"),
});

export default function UserForm() {
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();
    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });


    const onSubmit = async (data: FormValues): Promise<void> => {
        try {
            setLoading(true);
            const res = await axios.post<ApiResponse>(`${process.env.NEXT_PUBLIC_API_URL}/register`, data);
            router.push("/login");
            console.log("Form submitted successfully");
            setErrorMessage(null);
            alert("Form submitted successfully!");
        } catch (error: any) {
            console.log(error);
            setErrorMessage(error.response.data.message || "Submission failed!");
            // alert("Submission failed!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full justify-center items-center">

            <div className="w-full max-w-md p-6 border rounded-xl shadow-sm bg-card">
                <h1 className="mx-auto text-2xl font-semibold mb-6">Register</h1>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input type="text" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button disabled={loading} type="submit" className="w-full">
                            {loading ? "Submitting..." : "Submit"}
                        </Button>
                        {errorMessage && (
                            <p className="text-center text-sm text-red-500 mt-2">{errorMessage}</p>
                        )}

                        <CardFooter className="text-center text-sm text-gray-500 dark:text-gray-400">
                            Already have an account? <Link href="/login" className="text-blue-500 ml-2 "> Log in</Link>
                        </CardFooter>
                    </form>
                </Form>
            </div>
        </div >
    );
}
