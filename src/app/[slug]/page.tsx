"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectPage({ params }: { params: { slug: string } }) {
  const router = useRouter();

  useEffect(() => {
    async function handleRedirect() {
      const res = await fetch(`/api/redirect/${params.slug}`);
      const data = await res.json();
      if (data.original) {
        window.location.href = data.original;
      } else {
        router.replace("/");
      }
    }
    handleRedirect();
  }, [params.slug, router]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600 dark:text-gray-300">Redirecting...</p>
    </main>
  );
} 