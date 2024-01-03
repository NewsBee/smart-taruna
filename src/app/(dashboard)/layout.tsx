"use client"

import { NavBar } from "./_components/Navbar";
import { QueryClient, QueryClientProvider } from "react-query";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-full">
        <NavBar />
        {children}
      </div>
    </QueryClientProvider>
  );
}
