import { Button } from "@mui/material";
import type { BasicButtonProps } from "./ButtonInterface";

export default function BasicButton({ text, disabled }: BasicButtonProps) {
  return (
    <Button
      type="submit"
      fullWidth
      variant="contained"
      color="primary"
      disabled={disabled}
      sx={{ mt: 2, borderRadius: 2 }}
    >
      {text}
    </Button>
  );
}
