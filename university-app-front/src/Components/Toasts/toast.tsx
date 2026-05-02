import { Snackbar, Alert } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { removeToast } from "../../slices/toast/toastSlice";

export default function ToastContainer() {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((state) => state.toast.toasts);

  return (
    <>
      {toasts.map((toast) => (
        <Snackbar
          key={toast.id}
          open={true}
          autoHideDuration={3000}
          onClose={() => dispatch(removeToast(toast.id))}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() => dispatch(removeToast(toast.id))}
            severity={toast.type}
            variant="filled"
          >
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
}
