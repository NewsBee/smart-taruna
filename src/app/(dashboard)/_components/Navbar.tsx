"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { signOut, useSession } from "next-auth/react";
import { StyledButton } from "@/components/styled-button";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Image from "next/image";
import {
  Avatar,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react"; // Jangan lupa untuk mengimpor React useState
import { AccountCircle, ExitToApp } from "@mui/icons-material";

interface Props {}

export const NavBar: React.FC<Props> = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  // console.log(session)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [avatar, setAvatar] = useState("");
  const open = Boolean(anchorEl);

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        // console.log(data.userProfile.avatar)
        setAvatar(data.userProfile.avatar);
      } else {
        // Handle error atau setel state error jika perlu
        console.error("Failed to fetch profile data");
      }
    };

    fetchProfile();
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  // console.log(session)

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfile = () => {
    router.push("/profile");
    handleClose();
  };

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
        <div className="px-3">
          <Avatar
            src={avatar}
            alt="Profile"
            onClick={handleMenu}
            sx={{ cursor: "pointer", width: 40, height: 40 }}
          />
          <Menu
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            PaperProps={{
              sx: {
                width: 200, // Lebarkan kotak menu
                padding: "10px 10px", // Tambahkan padding atas dan bawah
              },
            }}
          >
            <MenuItem onClick={handleProfile} sx={{ padding: "10px 16px" }}>
              {" "}
              {/* Tambahkan padding */}
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              <Typography variant="inherit">Profile</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ padding: "10px 16px" }}>
              {" "}
              {/* Tambahkan padding */}
              <ListItemIcon>
                <ExitToApp fontSize="small" />
              </ListItemIcon>
              <Typography variant="inherit">Sign out</Typography>
            </MenuItem>
          </Menu>
        </div>
        {/* <Box sx={{ "& button:first-child": { mr: 2, fontWeight: 600 } }}>
          {session && (
            <StyledButton onClick={handleLogout} disableHoverEffect={true}>
              Sign out
            </StyledButton>
          )}
        </Box> */}
      </div>
    </div>
  );
};
