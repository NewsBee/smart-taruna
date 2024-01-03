import React, { FC } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { FooterNavigation, FooterSocialLinks } from "@/components/footer";
import Image from "next/image";

const Footer: FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#252C41",
        py: { xs: 6, md: 8 },
        color: "primary.contrastText",
      }}
    >
      <Container>
        <Grid container spacing={1}>
          <Grid item xs={12} md={5}>
            <Box sx={{ width: { xs: "100%", md: 360 }, mb: { xs: 3, md: 0 } }}>
              <Typography component="h2" variant="h2" sx={{ mb: 2 }}>
                Smart Taruna
              </Typography>
              <Image
                src="/images/logo.png"
                alt="Certificate icon"
                width={80}
                height={80}
                quality={97}
              />
              <Typography variant="subtitle1" sx={{ letterSpacing: 1, mb: 2 }}>
                Smart Taruna adalah layanan try out secara online yang sudah
                berjalan dari tahun 2018 sampai sekarang.
              </Typography>
              <FooterSocialLinks />
            </Box>
          </Grid>
          <Grid item xs={12} md={7}>
            <FooterNavigation />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
