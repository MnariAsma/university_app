import { Box, styled, Typography, type TypographyProps } from "@mui/material";
import React from "react";

export const LoginStyledBox = styled(Box)(({ theme }) => ({
  width: "60%",
  margin: "auto",
  display: "flex",
  flexDirection: "column",
  minWidth: "350px",
  gap: 0,
  animation: "fadeIn 0.5s ease-in-out both",
  [theme.breakpoints.down("lg")]: {
    width: "50%",
  },
}));

export const FormContainer: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  animation: "fadeIn 0.5s ease-in-out both",
};

export const LoginHeaderBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: theme.spacing(3),
}));

export const LoginIcon = styled(Box)(({ theme }) => ({
  marginRight: theme.spacing(1),
  fontSize: 32,
  color: theme.palette.primary.main,
}));

export const LoginTitle = styled(Typography)<TypographyProps>(() => ({
  textAlign: "center",
  fontWeight: "bold",
}));

export const LoginSubtitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));