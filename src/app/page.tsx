"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import {
  AppBar,
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Paper,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  IconButton,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LinkIcon from "@mui/icons-material/Link";
import SpeedIcon from "@mui/icons-material/Speed";
import SecurityIcon from "@mui/icons-material/Security";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import Link from "next/link";

const urlSchema = z.object({
  original: z.string().url({ message: "Please enter a valid URL." }),
  slug: z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    z.string().regex(/^[a-zA-Z0-9-_]*$/, { message: "Slug can only contain letters, numbers, - and _." }).optional()
  ),
});

export default function Home() {
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const theme = useTheme();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.success("URL copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy URL");
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShortUrl("");
    const result = urlSchema.safeParse({ original: url, slug });
    if (!result.success) {
      const msg = result.error.errors[0].message;
      setError(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ original: url, slug: slug || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "IP_LIMIT_EXCEEDED") {
          setShowSignupDialog(true);
        }
        throw new Error(data.error || "Failed to shorten URL");
      }
      setShortUrl(data.shortUrl);
      toast.success("Short URL created!");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" color="transparent" elevation={0} sx={{ backdropFilter: "blur(8px)" }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Shorly
          </Typography>
          <Button color="inherit" component={Link} href="/auth/signin">
            Login
          </Button>
          <Button variant="contained" color="primary" component={Link} href="/auth/signup" sx={{ ml: 2 }}>
            Sign Up
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: 8,
          mt: 8,
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ fontWeight: "bold" }}>
            Shorten Your Links with Confidence
          </Typography>
          <Typography variant="h5" align="center" sx={{ mb: 4 }}>
            Modern, secure, and analytics-powered URL shortener
          </Typography>
        </Container>
      </Box>

      {/* URL Shortener Form */}
      <Container maxWidth="md" sx={{ mt: -4, mb: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Paste your long URL here"
                variant="outlined"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Custom slug (optional)"
                variant="outlined"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                helperText="Only letters, numbers, - and _ are allowed"
              />
              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={loading}
                sx={{ py: 1.5 }}
              >
                {loading ? "Shortening..." : "Shorten URL"}
              </Button>
            </Box>
          </form>
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
          {shortUrl && (
            <Paper
              elevation={0}
              sx={{
                mt: 3,
                p: 2,
                bgcolor: 'success.light',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'success.main',
              }}
            >
              <Typography variant="subtitle2" color="success.dark" gutterBottom>
                Your shortened URL is ready!
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  fullWidth
                  value={shortUrl}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleCopy}
                          edge="end"
                          color={copied ? "success" : "default"}
                        >
                          {copied ? <CheckIcon /> : <ContentCopyIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  component="a"
                  href={shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit URL
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  onClick={handleCopy}
                >
                  {copied ? "Copied!" : "Copy URL"}
                </Button>
              </Box>
            </Paper>
          )}
        </Paper>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
          <Paper sx={{ p: 3, textAlign: "center", height: "100%" }}>
            <SpeedIcon sx={{ fontSize: 40, color: "primary.main", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Lightning Fast
            </Typography>
            <Typography color="text.secondary">
              Instant URL shortening with minimal latency
            </Typography>
          </Paper>
          <Paper sx={{ p: 3, textAlign: "center", height: "100%" }}>
            <SecurityIcon sx={{ fontSize: 40, color: "primary.main", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Secure & Reliable
            </Typography>
            <Typography color="text.secondary">
              Enterprise-grade security for your links
            </Typography>
          </Paper>
          <Paper sx={{ p: 3, textAlign: "center", height: "100%" }}>
            <AnalyticsIcon sx={{ fontSize: 40, color: "primary.main", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Detailed Analytics
            </Typography>
            <Typography color="text.secondary">
              Track clicks and engagement in real-time
            </Typography>
          </Paper>
        </Box>
      </Container>

      {/* FAQ Section */}
      <Container maxWidth="md" sx={{ mb: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Frequently Asked Questions
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>What is URL shortening?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                URL shortening is a technique to create shorter, more manageable links from long URLs. It makes sharing links easier and more professional.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Is it free to use?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Yes! You can create up to 3 shortened URLs without signing up. Create an account for unlimited URLs and advanced features.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>How long do shortened URLs last?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Your shortened URLs will remain active indefinitely unless you choose to delete them or they violate our terms of service.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Container>

      {/* Footer */}
      <Box component="footer" sx={{ bgcolor: "background.paper", py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Shorly. All rights reserved.
          </Typography>
        </Container>
      </Box>

      {/* Signup Dialog */}
      <Dialog open={showSignupDialog} onClose={() => setShowSignupDialog(false)}>
        <DialogTitle>Create an Account for More URLs</DialogTitle>
        <DialogContent>
          <Typography>
            You've reached the limit of 3 shortened URLs for guest users. Sign up now to get unlimited URLs and access to advanced features like:
          </Typography>
          <ul>
            <li>Unlimited URL shortening</li>
            <li>Detailed analytics</li>
            <li>Custom domains</li>
            <li>URL management dashboard</li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSignupDialog(false)}>Maybe Later</Button>
          <Button variant="contained" component={Link} href="/auth/signup" onClick={() => setShowSignupDialog(false)}>
            Sign Up Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 