import { Box, Container } from "@mui/material";
import LoginComponent from "../../modules/auth/Components/loginComponents/Login";
import { StyledContainerBox, StyledPaper } from "./LoginPageStyle";
const LoginPage = () => {
  return (
    <Container component="main" maxWidth="sm">
      <Box style={StyledContainerBox}>
        <StyledPaper elevation={5}>
          <LoginComponent />
        </StyledPaper>
      </Box>
    </Container>
  );
};

export default LoginPage;
