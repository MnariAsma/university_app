import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import { useLoginMutation } from "../Apis/AuthApi";
import { clearCredentials, setCredentials } from "../slices/authSlice";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);

  const [login, { isLoading }] = useLoginMutation();
  // const [forgotPassword, { isLoading: isForgotLoading }] = useForgotPasswordMutation();
  // const [resetPassword, { isLoading: isResetLoading }] = useResetPasswordMutation();
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

  // const handleForgotPassword = async (email: string) => {
  //   try {
  //     const response = await forgotPassword({ email }).unwrap();
  //     return { status: 200, message: response.message };
  //   } catch (err: any) {
  //     return {
  //       status: err?.status || 500,
  //       error: err?.data?.message || err?.error || "Erreur inconnue",
  //     };
  //   }
  // };

  // const handleResetPassword = async (data: any) => {
  //   try {
  //     const response = await resetPassword(data).unwrap();
  //     return { status: 200, message: response.message };
  //   } catch (err: any) {
  //     return {
  //       status: err?.status || 500,
  //       error: err?.data?.message || err?.error || "Erreur inconnue",
  //     };
  //   }
  // };

  return {
    user,
    token,
    handleLogin,
    handleLogout,
    // handleForgotPassword,
    // handleResetPassword,
    isLoading,
    // isForgotLoading,
    // isResetLoading,
  };
};
