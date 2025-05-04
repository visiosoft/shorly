"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface UrlAnalytics {
  url: {
    slug: string;
    original: string;
  };
  totalClicks: number;
  uniqueVisitors: number;
  clicksByDay: {
    date: string;
    clicks: number;
  }[];
  clicksByCountry: {
    country: string;
    clicks: number;
  }[];
  clicksByDevice: {
    device: string;
    clicks: number;
  }[];
  recentClicks: {
    timestamp: string;
    ip: string;
    userAgent: string;
    referrer: string;
  }[];
}

export default function UrlAnalyticsPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<UrlAnalytics | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchAnalytics();
    }
  }, [status, router, params.id]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/${params.id}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h5" color="error">
          Failed to load analytics data
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => router.push("/dashboard")}
          sx={{ textDecoration: "none" }}
        >
          Dashboard
        </Link>
        <Link
          component="button"
          variant="body1"
          onClick={() => router.push("/dashboard/analytics")}
          sx={{ textDecoration: "none" }}
        >
          Analytics
        </Link>
        <Typography color="text.primary">URL Analytics</Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom>
        Analytics for {analytics.url.slug}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {analytics.url.original}
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, mt: 3 }}>
        {/* Summary Cards */}
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Clicks
            </Typography>
            <Typography variant="h3">
              {analytics.totalClicks}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Unique Visitors
            </Typography>
            <Typography variant="h3">
              {analytics.uniqueVisitors}
            </Typography>
          </CardContent>
        </Card>

        {/* Clicks Over Time Chart */}
        <Box sx={{ gridColumn: { xs: "1", md: "1 / span 2" } }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Clicks Over Time
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.clicksByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="clicks" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>

        {/* Clicks by Country */}
        <Box>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Clicks by Country
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.clicksByCountry}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="country" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="clicks" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>

        {/* Clicks by Device */}
        <Box>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Clicks by Device
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.clicksByDevice}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="device" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="clicks" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>

        {/* Recent Clicks */}
        <Box sx={{ gridColumn: { xs: "1", md: "1 / span 2" } }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Clicks
            </Typography>
            <Box sx={{ maxHeight: 400, overflow: "auto" }}>
              {analytics.recentClicks.map((click, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    "&:last-child": {
                      borderBottom: "none",
                    },
                  }}
                >
                  <Typography variant="subtitle2">
                    {new Date(click.timestamp).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    IP: {click.ip || "Unknown"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Device: {click.userAgent || "Unknown"}
                  </Typography>
                  {click.referrer && (
                    <Typography variant="body2" color="text.secondary">
                      Referrer: {click.referrer}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
} 