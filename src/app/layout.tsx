import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./react-slick.css";
import { MUIProvider } from "@/providers";
import Providers from "@/components/auth/Provider";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smarttaruna",
  description: "Aplikasi Tryout Tes Kedinasan ",
  icons:{
    icon: "/images/logo.png",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="/images/logo.png" />
      </Head>
      <MUIProvider>
        <Providers>
          <body className={inter.className}>{children}</body>
        </Providers>
      </MUIProvider>
    </html>
  );
}
