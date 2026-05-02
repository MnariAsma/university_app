import React from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
} from "@mui/material";

export default function TeacherDashboard() {
  return (
    <Container maxWidth="md" style={{ marginTop: 24 }}>
      <Paper style={{ padding: 40, textAlign: "center" }} elevation={3}>
        <Typography variant="h4" gutterBottom color="primary.main" fontWeight="bold">
          Bienvenue dans l'Espace Enseignant
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Veuillez utiliser le menu de gauche pour accéder à la saisie des notes ou gérer votre profil.
        </Typography>
      </Paper>
    </Container>
  );
}
