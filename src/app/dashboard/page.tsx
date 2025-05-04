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

interface Url {
  id: string;
  slug: string;
  original: string;
  clicks: number;
  createdAt: string;
  lastClick?: {
    ip: string;
    userAgent: string;
    timestamp: string;
  };
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [urls, setUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchUrls();
    }
  }, [status, router]);

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
    <Box sx={{ display: "flex", bgcolor: '#f8fafc' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: '#106EBE',
          color: 'white',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              letterSpacing: '-0.025em',
            }}
          >
            Shorly Dashboard
          </Typography>
          <IconButton
            onClick={handleMenuOpen}
            size="small"
            sx={{ ml: 2 }}
            aria-controls="menu-appbar"
            aria-haspopup="true"
          >
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32,
                bgcolor: '#0FFCBE',
                color: '#106EBE',
                fontWeight: 600,
              }}
            >
              {session?.user?.name?.[0] || session?.user?.email?.[0]}
            </Avatar>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => router.push("/dashboard/settings")}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" sx={{ color: '#106EBE' }} />
              </ListItemIcon>
              <Typography sx={{ color: '#106EBE' }}>Settings</Typography>
            </MenuItem>
            <MenuItem onClick={() => signOut()}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: '#106EBE' }} />
              </ListItemIcon>
              <Typography sx={{ color: '#106EBE' }}>Logout</Typography>
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
            bgcolor: 'white',
            borderRight: '1px solid',
            borderColor: alpha('#106EBE', 0.1),
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            <ListItemButton 
              onClick={() => router.push("/dashboard")}
              sx={{
                '&:hover': {
                  bgcolor: alpha('#0FFCBE', 0.1),
                },
              }}
            >
              <ListItemIcon>
                <LinkIcon sx={{ color: '#106EBE' }} />
              </ListItemIcon>
              <ListItemText 
                primary="My URLs" 
                primaryTypographyProps={{
                  fontWeight: 500,
                  color: '#106EBE',
                }}
              />
            </ListItemButton>
            <ListItemButton 
              onClick={() => router.push("/dashboard/analytics")}
              sx={{
                '&:hover': {
                  bgcolor: alpha('#0FFCBE', 0.1),
                },
              }}
            >
              <ListItemIcon>
                <BarChartIcon sx={{ color: '#106EBE' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Analytics" 
                primaryTypographyProps={{
                  fontWeight: 500,
                  color: '#106EBE',
                }}
              />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container maxWidth="lg">
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography 
              variant="h4" 
              sx={{ 
                mb: 0,
                fontWeight: 700,
                letterSpacing: '-0.025em',
                color: '#106EBE',
              }}
            >
              All URLs
            </Typography>
            <Button
              variant="contained"
              startIcon={<LinkIcon />}
              onClick={() => router.push("/")}
              sx={{
                bgcolor: '#106EBE',
                '&:hover': {
                  bgcolor: '#0d5a9e',
                },
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
              }}
            >
              Create New URL
            </Button>
          </Box>

          <TableContainer 
            component={Paper} 
            sx={{ 
              bgcolor: 'white',
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha('#106EBE', 0.1),
            }}
          >
            <Table sx={{ minWidth: 650 }} aria-label="URLs table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#106EBE', fontWeight: 600 }}>Short URL</TableCell>
                  <TableCell sx={{ color: '#106EBE', fontWeight: 600 }}>Original URL</TableCell>
                  <TableCell sx={{ color: '#106EBE', fontWeight: 600 }}>Clicks</TableCell>
                  <TableCell sx={{ color: '#106EBE', fontWeight: 600 }}>Last Click</TableCell>
                  <TableCell sx={{ color: '#106EBE', fontWeight: 600 }}>Created</TableCell>
                  <TableCell sx={{ color: '#106EBE', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {urls.map((url) => (
                  <TableRow
                    key={url.id}
                    sx={{
                      '&:hover': {
                        bgcolor: alpha('#0FFCBE', 0.05),
                      },
                    }}
                  >
                    <TableCell>
                      <Typography sx={{ color: '#106EBE', fontWeight: 500 }}>
                        {url.slug}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        sx={{ 
                          color: '#106EBE',
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {url.original}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${url.clicks} clicks`}
                        size="small"
                        sx={{
                          fontWeight: 500,
                          bgcolor: alpha('#0FFCBE', 0.2),
                          color: '#106EBE',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {url.lastClick ? (
                        <Box>
                          <Typography variant="caption" sx={{ color: '#106EBE', display: 'block' }}>
                            {new Date(url.lastClick.timestamp).toLocaleString()}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#106EBE', display: 'block' }}>
                            {url.lastClick.ip}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" sx={{ color: '#106EBE' }}>
                          No clicks yet
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: '#106EBE' }}>
                        {new Date(url.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Analytics">
                          <IconButton
                            size="small"
                            onClick={() => router.push(`/dashboard/analytics/${url.id}`)}
                            sx={{
                              color: '#106EBE',
                              '&:hover': {
                                bgcolor: alpha('#0FFCBE', 0.1),
                              },
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Copy URL">
                          <IconButton
                            size="small"
                            onClick={() => handleCopy(`${window.location.origin}/${url.slug}`)}
                            sx={{
                              color: '#106EBE',
                              '&:hover': {
                                bgcolor: alpha('#0FFCBE', 0.1),
                              },
                            }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Open URL">
                          <IconButton
                            size="small"
                            component="a"
                            href={`/${url.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              color: '#106EBE',
                              '&:hover': {
                                bgcolor: alpha('#0FFCBE', 0.1),
                              },
                            }}
                          >
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete URL">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(url.id)}
                            sx={{
                              color: '#106EBE',
                              '&:hover': {
                                bgcolor: alpha('#0FFCBE', 0.1),
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Box>
    </Box>
  );
} 