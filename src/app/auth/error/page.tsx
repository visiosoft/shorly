"use client";

import { useSearchParams } from "next/navigation";
import { Container, Box, Typography, Button, Paper } from "@mui/material";
import Link from "next/link";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration.";
      case "AccessDenied":
        return "You do not have permission to sign in.";
      case "Verification":
        return "The verification link may have expired or already been used.";
      default:
        return "An error occurred during authentication.";
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Typography component="h1" variant="h4" sx={{ mb: 3, color: "error.main" }}>
            Authentication Error
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4, textAlign: "center" }}>
            {getErrorMessage(error)}
          </Typography>

          <Button
            component={Link}
            href="/auth/signin"
            variant="contained"
            fullWidth
            sx={{
              py: 1.5,
              backgroundColor: "primary.main",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}
          >
            Back to Sign In
          </Button>
        </Paper>
      </Box>
    </Container>
  );
} 