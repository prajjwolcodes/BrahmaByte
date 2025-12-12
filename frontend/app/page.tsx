import Link from "next/link";
import { Button } from "@/components/ui/button";

const Page = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <h1 className="text-4xl font-bold mb-12 text-center text-gray-900 dark:text-white">
        Brahmabyte
      </h1>

      <div className="flex flex-col gap-6">
        <Link href="/dashboard" passHref>
          <Button size="lg" className="w-64">
            Go to Dashboard
          </Button>
        </Link>

        <Link href="/login" passHref>
          <Button size="lg" variant="outline" className="w-64">
            Go to Login
          </Button>
        </Link>

        <Link href="/signup" passHref>
          <Button size="lg" className="w-64">
            Go to Signup
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Page;
