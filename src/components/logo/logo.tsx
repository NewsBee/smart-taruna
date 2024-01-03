import React, { FC } from "react";
import { Box, Typography } from "@mui/material";
import Image from "next/image";

interface Props {
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

const Logo: FC<Props> = ({ onClick, variant }) => {
  return (
    <Box onClick={onClick}>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 700,
          "& span": { color: variant === "primary" ? "#FFCB00" : "unset" },
        }}
      >
        <Image
          src="/images/logo.png"
          alt="Certificate icon"
          width={70}
          height={70}
          quality={97}
        />
      </Typography>
    </Box>
  );
};

Logo.defaultProps = {
  variant: "primary",
};

export default Logo;
