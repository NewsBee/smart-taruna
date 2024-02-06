"use client";

import { NavBar } from "./_components/Navbar";
import { QueryClient, QueryClientProvider } from "react-query";
import { SnackbarProvider } from "notistack";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();

  useEffect(() => {
    // Mencegah klik kanan
    const handleRightClick = (event:any) => {
      event.preventDefault();
    };

    // Mencegah shortcut keyboard untuk inspect element
    const handleKeyDown = (event: any) => {
      if (
        event.keyCode === 123 || // F12
        (event.ctrlKey &&
          event.shiftKey &&
          (event.keyCode === 73 ||
            event.keyCode === 74 ||
            event.keyCode === 67)) || // Ctrl + Shift + I / J / C
        (event.metaKey && event.altKey && event.keyCode === 73) // Command + Option + I (Mac)
      ) {
        event.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleRightClick);
    document.addEventListener("keydown", handleKeyDown);

    // Bersihkan event listener
    return () => {
      document.removeEventListener("contextmenu", handleRightClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider maxSnack={3}>
        <div className="h-full">
          <NavBar />
          {children}
        </div>
      </SnackbarProvider>
    </QueryClientProvider>
  );
}
