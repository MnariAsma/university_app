import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Typography, Button, Container } from "@mui/material";

const NotFoundPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Container>
      <Typography variant="h2" sx={{ fontWeight: "bold" }}>
        404
      </Typography>

      <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
        Oops! Page not found
      </Typography>

      <Button variant="outlined" onClick={() => navigate("/")}>
        Return to Home
      </Button>
    </Container>
  );
};

export default NotFoundPage;
