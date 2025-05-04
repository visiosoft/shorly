"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function AnalyticsDetailPage() {
  const { id } = useParams() as { id: string };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState<{ total: number; byDate: Record<string, number> } | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/analytics/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch analytics");
        setAnalytics(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchAnalytics();
  }, [id]);

  if (loading) {
    return <main className="flex flex-col items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div><p>Loading...</p></main>;
  }

  if (error) {
    return <main className="flex flex-col items-center justify-center min-h-screen"><p className="text-red-600">{error}</p></main>;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">URL Analytics</h1>
      <p className="mb-4">Total Clicks: <span className="font-semibold">{analytics?.total ?? 0}</span></p>
      <div className="w-full max-w-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="p-2">Date</th>
              <th className="p-2">Clicks</th>
            </tr>
          </thead>
          <tbody>
            {analytics && Object.entries(analytics.byDate).map(([date, count]) => (
              <tr key={date} className="border-t">
                <td className="p-2">{date}</td>
                <td className="p-2">{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
} 