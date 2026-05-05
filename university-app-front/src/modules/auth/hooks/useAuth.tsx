import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import { useLoginMutation } from "../Apis/AuthApi";
import { clearCredentials, setCredentials } from "../slices/authSlice";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);

  const [login, { isLoading }] = useLoginMutation();
  const isForgotLoading = false;
  const isResetLoading = false;
  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await login({ email, password }).unwrap();
      const userInfo={
        id:response.user.id,
        firstName:response.user.firstName,
        lastName:response.user.lastName,
        email:response.user.email,
        role:response.user.role,
      }
      dispatch(setCredentials({ user:userInfo, token: response.accessToken }));
      return { status: 200, user: response.user, message: "Login successful" };
    } catch (err: any) {
      return {
        status: err?.status || 500,
        error: err?.data?.message || err?.error || "Erreur inconnue",
      };
    }
  };

  const handleLogout = async () => {
    dispatch(clearCredentials());
  };

  const handleForgotPassword = async (_email: string): Promise<{ status: number; message?: string; error?: string }> => {
    return {
      status: 501,
      message: "Forgot password API is not configured yet.",
      error: "Forgot password API is not configured yet.",
    };
  };

  const handleResetPassword = async (_data: { token: string; newPassword: string }): Promise<{ status: number; message?: string; error?: string }> => {
    return {
      status: 501,
      message: "Reset password API is not configured yet.",
      error: "Reset password API is not configured yet.",
    };
  };

  return {
    user,
    token,
    handleLogin,
    handleLogout,
    handleForgotPassword,
    handleResetPassword,
    isLoading,
    isForgotLoading,
    isResetLoading,
  };
};
