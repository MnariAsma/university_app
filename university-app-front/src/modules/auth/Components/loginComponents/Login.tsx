import { Box, Typography } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";
import {
  FormContainer,
  LoginHeaderBox,
  LoginIcon,
  LoginStyledBox,
  LoginSubtitle,
  LoginTitle,
} from "./loginStyle/loginStyle";
import { Login } from "@mui/icons-material";
import BasicInput from "../../../../Components/Inputs/basicInputs/BasicInput";
import PasswordInput from "../../../../Components/Inputs/passwordInput/PasswordInput";
import BasicButton from "../../../../Components/Buttons/Button";
import { httpStatusCode } from "../../../../constants/httpStatusCode";
import { texts } from "../../../../constants/texts";
import { signInFormValidation } from "../../validation/signIn";
import { useAppDispatch } from "../../../../hooks/reduxHooks";
import { addToast } from "../../../../slices/toast/toastSlice";
import { useNavigate, Link } from "react-router-dom";
import type { LoginFormValues } from "./loginInterface";
import {
  DASHBOARD,
  STUDENT_DASHBOARD,
  TEACHER_DASHBOARD,
} from "../../../../routes/routes";
import { ROLES } from "../../../../constants/constants";

export default function LoginComponent() {
  const { handleLogin, isLoading } = useAuth();
  const validationRules = signInFormValidation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const form = useForm<LoginFormValues>({
    mode: "onSubmit",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    const response = await handleLogin(data.email, data.password);

    if (response?.status === httpStatusCode.success) {
      dispatch(
        addToast({
          message: response.message || texts.login.successMessage,
          type: "success",
        })
      );
      const role = response.user.role;
      if (role === ROLES.TEACHER) {
        navigate(TEACHER_DASHBOARD);
      } else if (role === ROLES.STUDENT) {
        navigate(STUDENT_DASHBOARD);
      } else {
        navigate(DASHBOARD);
      }
    } else {
      dispatch(
        addToast({
          message: response.error || texts.login.errorMessage,
          type: "error",
        })
      );
    }
  };
  const { handleSubmit } = form;
  return (
    <LoginStyledBox>
      <LoginHeaderBox>
        <LoginIcon as={Login} />
        <LoginTitle component="h1" variant="h4">
          {texts.login.loginTitle}
        </LoginTitle>
      </LoginHeaderBox>

      <LoginSubtitle variant="body2">
        {texts.login.loginSubtitle}
      </LoginSubtitle>

      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)} style={FormContainer}>
          <BasicInput
            name="email"
            label={texts.common.emailLabel}
            placeholder={texts.common.emailPlaceholder}
            type="email"
            rules={validationRules.email}
          />

          <PasswordInput
            name="password"
            label={texts.common.passwordLabel}
            placeholder={texts.common.passwordPlaceholder}
            rules={validationRules.password}
          />

          <BasicButton text={texts.login.loginBtn} disabled={isLoading} />
          
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2">
              {texts.login.forgotPasswordText}{" "}
              <Link to="/forgot-password" style={{ color: "#1976d2", textDecoration: "none", fontWeight: "bold" }}>
                {texts.login.forgotPasswordLink}
              </Link>
            </Typography>
          </Box>
        </form>
      </FormProvider>
    </LoginStyledBox>
  );
}
