"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  AppBar,
  Toolbar,
  Avatar,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tooltip,
  useTheme,
  ListItemButton,
  alpha,
} from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2';
import {
  Link as LinkIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  ContentCopy as ContentCopyIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  OpenInNew as OpenInNewIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  Devices as DevicesIcon,
} from "@mui/icons-material";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";

const CountryMap = dynamic(() => import("@/components/CountryMap"), {
  ssr: false,
});

interface Url {
  id: string;
  slug: string;
  original: string;
  clicks: number;
  createdAt: string;
}

interface AnalyticsData {
  totalClicks: number;
  countries: {
    country: string;
    clicks: number;
  }[];
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [urls, setUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const theme = useTheme();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchUrls();
      fetchAnalytics();
    }
  }, [status, router]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics/countries");
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      toast.error("Failed to fetch analytics");
    }
  };

  const fetchUrls = async () => {
    try {
      const response = await fetch("/api/urls");
      const data = await response.json();
      setUrls(data);
    } catch (error) {
      toast.error("Failed to fetch URLs");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy URL");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/urls/${id}`, { method: "DELETE" });
      toast.success("URL deleted successfully");
      fetchUrls();
    } catch (error) {
      toast.error("Failed to delete URL");
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (status === "loading" || loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <Avatar sx={{ width: 32, height: 32 }}>
              {session?.user?.name?.[0] || session?.user?.email?.[0]}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => signOut()}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: 240,
            boxSizing: "border-box",
          },
        }}
        open={drawerOpen}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            <ListItemButton>
              <ListItemIcon>
                <LinkIcon />
              </ListItemIcon>
              <ListItemText primary="URLs" />
            </ListItemButton>
            <ListItemButton>
              <ListItemIcon>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" />
            </ListItemButton>
            <ListItemButton>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {/* Country Map */}
            <Box sx={{ flex: '1 1 calc(66.666% - 12px)', minWidth: 300 }}>
              {analytics && (
                <Paper elevation={3} sx={{ p: 2, height: "100%" }}>
                  <Typography variant="h6" gutterBottom>
                    Click Distribution
                  </Typography>
                  <CountryMap
                    data={analytics.countries}
                    totalClicks={analytics.totalClicks}
                  />
                </Paper>
              )}
            </Box>

            {/* Analytics Summary */}
            <Box sx={{ flex: '1 1 calc(33.333% - 12px)', minWidth: 300 }}>
              <Paper elevation={3} sx={{ p: 2, height: "100%" }}>
                <Typography variant="h6" gutterBottom>
                  Analytics Summary
                </Typography>
                {analytics && (
                  <>
                    <Typography variant="h4" color="primary" gutterBottom>
                      {analytics.totalClicks}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      Total Clicks
                    </Typography>
                    <Typography variant="h4" color="primary" sx={{ mt: 2 }} gutterBottom>
                      {analytics.countries.length}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      Countries Reached
                    </Typography>
                  </>
                )}
              </Paper>
            </Box>

            {/* URLs Table */}
            <Box sx={{ width: '100%' }}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="h6">Your URLs</Typography>
                  <Button
                    variant="contained"
                    startIcon={<LinkIcon />}
                    onClick={() => router.push("/")}
                  >
                    Create New URL
                  </Button>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Short URL</TableCell>
                        <TableCell>Original URL</TableCell>
                        <TableCell align="center">Clicks</TableCell>
                        <TableCell align="center">Created</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {urls.map((url) => (
                        <TableRow key={url.id}>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography>{url.slug}</Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleCopy(`${window.location.origin}/${url.slug}`)}
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography noWrap sx={{ maxWidth: 300 }}>
                              {url.original}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              icon={<VisibilityIcon />}
                              label={url.clicks}
                              color="primary"
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            {new Date(url.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              color="primary"
                              onClick={() => window.open(`/${url.slug}`, "_blank")}
                            >
                              <OpenInNewIcon />
                            </IconButton>
                            <IconButton
                              color="primary"
                              onClick={() => router.push(`/dashboard/analytics/${url.id}`)}
                            >
                              <BarChartIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDelete(url.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
} 