"use client"

import { NavBar } from "./_components/Navbar";
import { QueryClient, QueryClientProvider } from "react-query";
import { SnackbarProvider } from 'notistack';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();
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
