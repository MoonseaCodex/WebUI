"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Container, Paper, Typography } from "@mui/material";
import { Button, TextField, Link, Divider } from "@mui/material";

import useSnackbar from "@/data/store/snackbar";
import { useUserStatus } from "@/data/fetch/auth";

export default function ForgotPassword() {
  const displayMessage = useSnackbar((s) => s.displayMessage);
  const { data: userStatus, requestPasswordReset } = useUserStatus();
  const router = useRouter();

  const [email, setEMail] = useState<string>("");

  const validateEMail = () => {
    if (!email || email.length < 3) return false;
    if (!email.match(/\w+@\w{2,32}\.\w{2,16}/)) return false;
    return true;
  };

  const handleSubmit = () => {
    requestPasswordReset(email).then((_response) => {
      displayMessage("Check email for password reset link", "info");
      router.push("/auth/login");
    });
  };

  const keyPressHandler = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && validateEMail()) handleSubmit();
  };

  // If user is already logged in don't let them waste their time here
  useEffect(() => {
    if (userStatus?.authenticated) router.push("/characters");
  }, [userStatus]);

  return (
    <Container sx={{ display: "flex", height: "calc(100vh - 7em)" }}>
      <Paper
        elevation={12}
        sx={{
          alignSelf: "center",
          width: "25em",
          margin: "auto",
          display: "flex",
          padding: "0.8em 2em",
          flexDirection: "column",
          alignItems: "center",
        }}
        onKeyDown={keyPressHandler}
      >
        <Typography variant="h4">Account Recovery</Typography>
        <Divider sx={{ width: "100%", marginBottom: "0.4em" }} />
        <Typography variant="caption">
          Enter the email account you registered with
        </Typography>
        <Typography variant="caption">
          If found you will receive a password reset email
        </Typography>
        <TextField
          fullWidth
          value={email}
          label="eMail address"
          autoComplete="email"
          onChange={(e) => setEMail(e.target.value)}
        />
        <Button
          sx={{ width: "50%", margin: "0.4em" }}
          variant="contained"
          disabled={!validateEMail()}
          onClick={handleSubmit}
        >
          Request reset
        </Button>
        <Divider sx={{ width: "100%", marginBottom: "0.4em" }} />
        <Link
          variant="caption"
          sx={{ cursor: "pointer" }}
          onClick={() => router.push("/auth/register")}
        >
          Register a new account
        </Link>
        <Link
          variant="caption"
          sx={{ cursor: "pointer" }}
          onClick={() => router.push("/auth/login")}
        >
          Login with existing account
        </Link>
      </Paper>
    </Container>
  );
}
