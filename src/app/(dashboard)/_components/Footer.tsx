import React from "react";
import Logo from "../assets/logos/White-Black-Circle.png";
import Image from "next/image";

export const Footer = () => (
  <footer className="bg-white shadow-large py-3 flex items-center justify-center">
    <Image src="/images/logo.png" className="h-10 w-10 object-cover" alt="landing" />
    <p className="text-center">&copy; Quizco 2022</p>
  </footer>
);
