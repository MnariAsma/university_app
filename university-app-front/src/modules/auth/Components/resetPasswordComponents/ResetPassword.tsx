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
import { LockReset } from "@mui/icons-material";
import PasswordInput from "../../../../Components/Inputs/passwordInput/PasswordInput";
import BasicButton from "../../../../Components/Buttons/Button";
import { httpStatusCode } from "../../../../constants/httpStatusCode";
import { useAppDispatch } from "../../../../hooks/reduxHooks";
import { addToast } from "../../../../slices/toast/toastSlice";
import { useNavigate, useLocation } from "react-router-dom";

interface ResetPasswordFormValues {
  password: string;
}

export default function ResetPasswordComponent() {
  const { handleResetPassword, isResetLoading } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from query parameters
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  const form = useForm<ResetPasswordFormValues>({
    mode: "onSubmit",
    defaultValues: { password: "" },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      dispatch(addToast({ message: "Invalid or missing token", type: "error" }));
      return;
    }

    const response = await handleResetPassword({ token, newPassword: data.password });

    if (response?.status === httpStatusCode.success) {
      dispatch(
        addToast({
          message: response.message || "Password reset successful",
          type: "success",
        })
      );
      navigate("/auth"); // Redirect to login
    } else {
      dispatch(
        addToast({
          message: response.error || "Failed to reset password",
          type: "error",
        })
      );
    }
  };
  
  const { handleSubmit } = form;
  return (
    <LoginStyledBox>
      <LoginHeaderBox>
        <LoginIcon as={LockReset} />
        <LoginTitle component="h1" variant="h4">
          Reset Password
        </LoginTitle>
      </LoginHeaderBox>

      <LoginSubtitle variant="body2">
        Enter your new password below
      </LoginSubtitle>

      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)} style={FormContainer}>
          <PasswordInput
            name="password"
            label="New Password"
            placeholder="Enter your new password"
            rules={{
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            }}
          />

          <BasicButton text="Reset Password" disabled={isResetLoading} />
        </form>
      </FormProvider>
    </LoginStyledBox>
  );
}
