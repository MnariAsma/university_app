export interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  strings: {
    DELETE_DIALOG_TITLE: string;
    DELETE_DIALOG_MESSAGE: string;
    DELETE_SUCCESS_MSG: string;
    DELETE_ERROR_MSG: string;
  };
}