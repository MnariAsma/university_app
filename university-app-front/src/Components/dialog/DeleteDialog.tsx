import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
} from "@mui/material";
import ReportIcon from "@mui/icons-material/Report";
import { useAppDispatch } from "../../hooks/reduxHooks";
import { addToast } from "../../slices/toast/toastSlice";
import { BUTTONS } from "../../constants/constants";
import type { DeleteDialogProps } from "./DeleteDialogInterface";
import RoundedButton from "../Buttons/RoundedButton";

const DeleteDialog = ({
  open,
  onClose,
  onConfirm,
  strings,
}: DeleteDialogProps) => {
  const dispatch = useAppDispatch();

  const handleConfirm = async () => {
    try {
      await onConfirm();
      dispatch(
        addToast({ message: strings.DELETE_SUCCESS_MSG, type: "success" })
      );
      onClose();
    } catch (error) {
      console.error(strings.DELETE_ERROR_MSG, error);
      dispatch(addToast({ message: strings.DELETE_ERROR_MSG, type: "error" }));
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{strings.DELETE_DIALOG_TITLE}</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ alignItems: "center", mt: 1 }}>
          <ReportIcon fontSize="large" color="error" />
          <Typography>{strings.DELETE_DIALOG_MESSAGE}</Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <RoundedButton onClick={onClose} variant="outlined">
          {BUTTONS.cancel}
        </RoundedButton>
        <RoundedButton
          onClick={handleConfirm}
          color="error"
          variant="contained"
        >
          {BUTTONS.confirm}
        </RoundedButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
