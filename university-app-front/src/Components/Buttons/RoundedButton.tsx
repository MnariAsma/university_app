import { Button } from "@mui/material";
import React from "react";
import type { RoundedButtonProps } from "./ButtonInterface";

const RoundedButton: React.FC<RoundedButtonProps> = ({ sx, ...props }) => {
  return (
    <Button
      {...props}
      sx={{
        borderRadius: 4, 
        textTransform: "none",
        ...sx,
      }}
    />
  );
};

export default RoundedButton;
