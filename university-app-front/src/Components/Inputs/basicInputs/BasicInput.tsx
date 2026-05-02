import { TextField } from "@mui/material";
import { useFormContext, Controller } from "react-hook-form";
import type { BasicInputProps } from "./BasicInputInterface";

export default function BasicInput({
  name,
  label,
  placeholder,
  type = "text",
  rules = {},
}: BasicInputProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          fullWidth
          margin="normal"
          type={type}
          label={label}
          placeholder={placeholder}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          value={field.value ?? ""}
          InputLabelProps={{
            shrink: type === "date" || type === "time" ? true : undefined,
          }}
        />
      )}
    />
  );
}