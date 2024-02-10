import React, { FC } from "react";
import Link from "next/link";
import Grid from "@mui/material/Grid";
import MuiLink from "@mui/material/Link";
import type { Navigation } from "@/interfaces/navigation";
import { navigations as headerNavigations } from "@/components/navigation/navigation.data";
import { FooterSectionTitle } from "@/components/footer";
import { Email, Map, WhatsApp } from "@mui/icons-material";

const headOfficeMenu: Array<Navigation> = [
  {
    label: "Alamat Kantor Jl. Martadinata No.158",
    path: "https://www.google.com/maps/place...",
    icon: "Map",
  },
  {
    label: "smarttarunaprima@gmail.com",
    path: "#",
    icon: "Email",
  },
  {
    label: "+62 819-1822-6951",
    path: "wa.me/6281918226951",
    icon: "WhatsApp",
  },
  {
    label: "+62 819-1917-0008",
    path: "wa.me/6281919170008",
    icon: "WhatsApp",
  },
  {
    label: "+62 813-4544-4045",
    path: "wa.me/6281345444045",
    icon: "WhatsApp",
  },
  // Tambahkan entri lain jika diperlukan
];

const pageMenu = headerNavigations;

const companyMenu: Array<Navigation> = [
  { label: "Hubungi kami", path: "#" },
  { label: "Privacy & Policy", path: "#" },
  { label: "Term & Condition", path: "#" },
  { label: "FAQ", path: "#" },
];

const smartTarunaEducationMenu: Array<Navigation> = [
  { label: "Tentang Kami", path: "https://smarttarunaeducation.com/about-us/" },
  { label: "Kontak Kami", path: "https://smarttarunaeducation.com/contact-us/" },
  { label: "FAQ", path: "#" },
  { label: "Blog", path: "https://smarttarunaeducation.com/post/" },
  { label: "Gallery", path: "https://smarttarunaeducation.com/gallery/" },
];

interface NavigationItemProps {
  label: string;
  path: string;
  icon?: string;
}

const NavigationItem: FC<NavigationItemProps> = ({ label, path, icon }) => {
  const IconComponent = icon === "Email" ? Email : icon === "Map" ? Map : WhatsApp; // Menentukan komponen ikon berdasarkan prop icon
  return (
    <a href={path} target="_blank">
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}
      >
         {icon && <IconComponent style={{ marginRight: "8px" }} />} {/* Menampilkan ikon */}
        <MuiLink
          underline="hover"
          sx={{
            display: "block",
            color: "primary.contrastText",
          }}
        >
          {label}
        </MuiLink>
      </div>
    </a>
  );
};

const FooterNavigation: FC = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={4} lg={5}>
        <FooterSectionTitle title="Head Office" />
        {headOfficeMenu.map(({ label, path, icon }, index) => (
          <NavigationItem key={index + label} label={label} path={path} icon={icon} />
        ))}
      </Grid>
      {/* <Grid item xs={12} md={4}>
        <FooterSectionTitle title="Menu" />
        {pageMenu.map(({ label, path }, index) => (
          <NavigationItem key={index + path} label={label} path={path} />
        ))}
      </Grid> */}
      <Grid item xs={12} md={4} lg={5}>
        <FooterSectionTitle title="Smart Taruna Education" />
        {smartTarunaEducationMenu.map(({ label, path }, index) => (
          <NavigationItem key={index + path} label={label} path={path} />
        ))}
      </Grid>
    </Grid>
  );
};

export default FooterNavigation;
