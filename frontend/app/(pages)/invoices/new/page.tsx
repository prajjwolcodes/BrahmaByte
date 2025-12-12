"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ItemSchema = z.object({
    item: z.string().min(1, "Item name is required"),
    qty: z.number().min(1, "Qty must be > 0"),
    price: z.number().min(1, "Price must be > 0"),
});

const InvoiceSchema = z.object({
    customer: z.string().min(1, "Customer is required"),
    date: z.string().min(1, "Date is required"),
    dueDate: z.string().min(1, "Due date is required"),
    description: z.string().optional(),
    items: z.array(ItemSchema).min(1, "At least one item required"),
});

type InvoiceForm = z.infer<typeof InvoiceSchema>;

export default function NewInvoicePage() {
    const { initialized, isLoggedIn } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [error, setError] = useState<string | null>(null);

    const form = useForm<InvoiceForm>({
        resolver: zodResolver(InvoiceSchema),
        defaultValues: {
            customer: "",
            date: "",
            dueDate: "",
            description: "",
            items: [{ item: "", qty: 1, price: 1 }],
        },
    });

    useEffect(() => {
        if (!initialized) return;
        if (!isLoggedIn) {
            router.push("/login");
        }
    }, [initialized, isLoggedIn, router]);

    const createInvoiceMutation = useMutation({
        mutationFn: async (data: InvoiceForm) => {
            const payload = {
                ...data,
                items: data.items.map((it) => ({
                    item: it.item,
                    qty: Number(it.qty),
                    price: Number(it.price),
                })),
            };
            const res = await apiClient.post("/invoices", payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            router.push("/dashboard");
        },
        onError: (e: any) => {
            setError(e.response?.data?.message || "Failed to create invoice");
        },
    });

    const onSubmit = async (data: InvoiceForm) => {
        setError(null);
        createInvoiceMutation.mutate(data);
    };

    const addItem = () => {
        const items = form.getValues("items");
        form.setValue("items", [...items, { item: "", qty: 1, price: 1 }]);
    };

    const removeItem = (index: number) => {
        const items = form.getValues("items");
        form.setValue("items", items.filter((_, i) => i !== index));
    };

    if (!initialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">Loading...</div>
        );
    }
    if (!isLoggedIn) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>Create Invoice</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <p className="text-sm text-red-600 mb-4">{error}</p>
                    )}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="customer"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Customer</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Customer name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Invoice Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dueDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Due Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Optional" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <FormLabel>Items</FormLabel>
                                    <Button type="button" onClick={addItem} variant="secondary">Add Item</Button>
                                </div>
                                {form.watch("items").map((_, index) => (
                                    <div key={index} className="grid grid-cols-3 gap-3 mb-3">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.item` as const}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="Item name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.qty` as const}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="number" min={1} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.price` as const}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="number" min={1} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="col-span-3 flex justify-end">
                                            <Button type="button" variant="destructive" onClick={() => removeItem(index)}>
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <FormMessage>{form.formState.errors.items?.message as any}</FormMessage>
                            </div>

                            <Button type="submit" disabled={createInvoiceMutation.isPending}>
                                {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
