"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";
import LogoutButton from "@/components/logoutButton";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Invoice {
  id: number;
  invoiceNumber: string;
  customer: string;
  amount: number;
  date: string;
  dueDate: string;
  status: "Paid" | "Unpaid" | "Overdue";
  description: string;
  items: { item: string; quantity: number; price: number }[];
}

export default function Dashboard() {
  const { isLoggedIn, initialized } = useAuth();
  const router = useRouter();

  const fetchInvoices = async () => {
    const response = await apiClient.get("/invoices");
    return response.data.invoices as Invoice[];
  };

  const { data: invoices = [], isLoading, error, refetch, isFetching, dataUpdatedAt, status } = useQuery({
    queryKey: ["invoices"],
    queryFn: fetchInvoices,
    enabled: initialized && isLoggedIn,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!initialized) return;
    if (!isLoggedIn) router.push("/login");
  }, [isLoggedIn, initialized, router]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-lg text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-lg text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your invoices
          </p>
          <div className="flex gap-2 mt-3">
            <span className={`text-xs font-medium px-2 py-1 rounded ${!isFetching && status === "success" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"}`}>
              {!isFetching && status === "success" ? "📦 From Cache" : "🔄 Fresh Fetch"}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Last fetched: {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : "Never"}
            </span>
          </div>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex items-center gap-2"
          >
            <Link href="/invoices/new">Create New</Link>
          </Button>
          <Button onClick={() => refetch()} variant="outline" className="flex items-center gap-2" disabled={isFetching}>
            Refresh
          </Button>
          <LogoutButton />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <CardContent className="pt-6">
            <p className="text-red-700 dark:text-red-400">{(error as any)?.message || "Failed to fetch invoices"}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </CardContent>
        </Card>
      ) : invoices.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-gray-500 dark:text-gray-400">
              No invoices found
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Invoices ({invoices.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Items</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>{invoice.customer}</TableCell>
                      <TableCell className="font-semibold">
                        ${invoice.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${invoice.status === "Paid"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : invoice.status === "Unpaid"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                        >
                          {invoice.status}
                        </span>
                      </TableCell>
                      <TableCell>{invoice.description}</TableCell>
                      <TableCell>{invoice.items.map(item => item.item).join(", ")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}