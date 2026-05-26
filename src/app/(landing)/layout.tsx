"use client";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Box } from "@mui/material";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="">
      <Box component="main">
        <Header />
        <div className="h-full w-full">{children}</div>
        <Footer />
      </Box>
    </main>
  );
};

export default LandingLayout;
