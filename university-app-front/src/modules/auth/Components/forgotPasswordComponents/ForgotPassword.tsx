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
} from "../loginComponents/loginStyle/loginStyle";
import { Email } from "@mui/icons-material";
import BasicInput from "../../../../Components/Inputs/basicInputs/BasicInput";
import BasicButton from "../../../../Components/Buttons/Button";
import { httpStatusCode } from "../../../../constants/httpStatusCode";
import { useAppDispatch } from "../../../../hooks/reduxHooks";
import { addToast } from "../../../../slices/toast/toastSlice";
import { Link } from "react-router-dom";

interface ForgotPasswordFormValues {
  email: string;
}

export default function ForgotPasswordComponent() {
  const { handleForgotPassword, isForgotLoading } = useAuth();
  const dispatch = useAppDispatch();

  const form = useForm<ForgotPasswordFormValues>({
    mode: "onSubmit",
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    const response = await handleForgotPassword(data.email);

if (response?.status === httpStatusCode.success) {
  const isUserNotFound =
    response.message?.toLowerCase().includes("not exist");

  dispatch(
    addToast({
      message: response.message || "Reset link sent to your email",
      type: isUserNotFound ? "error" : "success",
    })
  );
  
    } else {
      dispatch(
        addToast({
          message: response.error || "Failed to send reset link",
          type: "error",
        })
      );
    }
  };
  const { handleSubmit } = form;
  return (
    <LoginStyledBox>
      <LoginHeaderBox>
        <LoginIcon as={Email} />
        <LoginTitle component="h1" variant="h4">
          Forgot Password
        </LoginTitle>
      </LoginHeaderBox>

      <LoginSubtitle variant="body2">
        Enter your email to receive a reset link
      </LoginSubtitle>

      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)} style={FormContainer}>
          <BasicInput
            name="email"
            label="Email"
            placeholder="Enter your email"
            type="email"
            rules={{
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            }}
          />

          <BasicButton text="Send Reset Link" disabled={isForgotLoading} />
          
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2">
              Remember your password?{" "}
              <Link to="/auth" style={{ color: "#1976d2", textDecoration: "none", fontWeight: "bold" }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </form>
      </FormProvider>
    </LoginStyledBox>
  );
}
