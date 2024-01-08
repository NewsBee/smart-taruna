"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { signOut, useSession } from "next-auth/react";
import { StyledButton } from "@/components/styled-button";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Image from "next/image";

interface Props {}

export const NavBar: React.FC<Props> = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  // console.log(session)

  const handleLogout = async () => {
    // Call the signOut method from next-auth to initiate the logout process
    const result = await signOut({
      // Redirect to the home page or any other page after logging out
      redirect: true,
      callbackUrl: "/",
    });
    if (result) {
      router.push("/"); // Redirect to the URL provided by NextAuth.js or a desired path
    }
  };
  return (
    <div className="px-4 sm:px-10 py-4 flex items-center h-[8%]">
      <Link
        href={"/"}
        className="font-semibold text-gray-888 text-xs sm:text-xl flex items-center"
      >
        <div className="relative w-10 h-10">
          <Image
            src="/images/logo.png"
            alt="Quizco Logo"
            layout="fill"
            objectFit="cover" // or any other fitting method
          />
        </div>

        <p>Smart Taruna</p>
      </Link>
      <div className="ml-auto flex items-center">
        {/* <Link href="/auth/sign-up" className="mr-4">
          <p className="cursor-pointer rounded-full px-3 py-2 bg-indigo-600 text-white font-normal">
            Sign Up
          </p>
        </Link>
        <Link href="/auth/sign-in">
          <p className="text-indigo-600 cursor-pointer rounded-full px-2.5 py-1.5 border-indigo-600 border-2 text-primary font-normal">
            Sign In
          </p>
        </Link> */}

        {/* <SignedIn> */}
        <Link href="/dashboard" className="">
          <p className="text-default text-xs sm:text-sm cursor-pointer px-4">
            Dashboard
          </p>
        </Link>
        <Box sx={{ "& button:first-child": { mr: 2, fontWeight: 600 } }}>
          {session && (
            <StyledButton onClick={handleLogout} disableHoverEffect={true}>
              Sign out
            </StyledButton>
          )}
        </Box>
        {/* <img src="" alt="" /> */}
        {/* <UserButton afterSignOutAllUrl="/" afterSignOutOneUrl="/" /> */}
        {/* </SignedIn> */}
      </div>
    </div>
  );
};
