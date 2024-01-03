import React, { FC } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Slider, { Settings } from "react-slick";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useTheme, styled } from "@mui/material/styles";
import { Rating, useMediaQuery } from "@mui/material";
import IconArrowBack from "@mui/icons-material/ArrowBack";
import IconArrowForward from "@mui/icons-material/ArrowForward";
import IconButton, { iconButtonClasses } from '@mui/material/IconButton'

import { data } from "./popular-course.data";
import { CourseCardItem } from "@/components/course";
import { ArrowForward } from "@mui/icons-material";
import Image from "next/image";

interface SliderArrowArrow {
  onClick?: () => void;
  type: "next" | "prev";
  className?: "string";
}

const SliderArrow: FC<SliderArrowArrow> = (props) => {
  const { onClick, type, className } = props;
  return (
    <IconButton
      sx={{
        backgroundColor: "background.paper",
        color: "primary.main",
        "&:hover": {
          backgroundColor: "primary.main",
          color: "primary.contrastText",
        },
        bottom: { xs: "-70px !important", md: "-28px !important" },
        left: "unset !important",
        right: type === "prev" ? "60px !important" : "0 !important",
        zIndex: 10,
        boxShadow: 1,
      }}
      disableRipple
      color="inherit"
      onClick={onClick}
      className={className}
    >
      {type === "next" ? (
        <IconArrowForward sx={{ fontSize: 22 }} />
      ) : (
        <IconArrowBack sx={{ fontSize: 22 }} />
      )}
    </IconButton>
  );
};

const StyledDots = styled("ul")(({ theme }) => ({
  "&.slick-dots": {
    position: "absolute",
    left: 0,
    bottom: -20,
    paddingLeft: theme.spacing(1),
    textAlign: "left",
    "& li": {
      marginRight: theme.spacing(2),
      "&.slick-active>div": {
        backgroundColor: theme.palette.primary.main,
      },
    },
  },
}));

const HomePopularCourse: FC = () => {
  const { breakpoints } = useTheme();
  const matchMobileView = useMediaQuery(breakpoints.down("md"));

  const sliderConfig: Settings = {
    infinite: false,
    autoplay: false,
    speed: 300,
    slidesToShow: matchMobileView ? 1 : 3,
    slidesToScroll: 1,
    prevArrow: <SliderArrow type="prev" />,
    nextArrow: <SliderArrow type="next" />,
    dots: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
    appendDots: (dots) => <StyledDots>{dots}</StyledDots>,
    customPaging: () => (
      <Box
        sx={{
          height: 8,
          width: 30,
          backgroundColor: "divider",
          display: "inline-block",
          borderRadius: 4,
        }}
      />
    ),
  };

  return (
    <Box
      id="popular-course"
      sx={{
        pt: {
          xs: 6,
          md: 8,
        },
        pb: 14,
        backgroundColor: "background.default",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Box
              sx={{
                height: "100%",
                width: { xs: "100%", md: "90%" },
                display: "flex",
                alignItems: "center",
                justifyContent: { xs: "center", md: "flex-start" },
              }}
            >
              <Typography
                variant="h1"
                sx={{ mt: { xs: 0, md: -5 }, fontSize: { xs: 30, md: 48 } }}
              >
                Most Popular Courses
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={9}>
            <Box
              sx={{
                px: 1,
                py: 4,
              }}
            >
              <Box
                sx={{
                  p: 2,
                  backgroundColor: "background.paper",
                  borderRadius: 4,
                  transition: (theme) =>
                    theme.transitions.create(["box-shadow"]),
                  "&:hover": {
                    boxShadow: 2,
                    [`& .${iconButtonClasses.root}`]: {
                      backgroundColor: "primary.main",
                      color: "primary.contrastText",
                      boxShadow: 2,
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    lineHeight: 0,
                    overflow: "hidden",
                    borderRadius: 3,
                    mb: 2,
                  }}
                >
                  <Image
                    src={"/images/courses/a9e7b27a0c5e986a22416d79e2e9dba9.jpg"}
                    width={760}
                    height={760}
                    alt={"Course "}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    component="h2"
                    variant="h5"
                    sx={{
                      mb: 2,
                      height: 56,
                      overflow: "hidden",
                      fontSize: "1.2rem",
                    }}
                  >
                    Android Development from Zeo to Hero
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Rating
                      name="rating-course"
                      value={5}
                      max={5}
                      sx={{ color: "#ffce31", mr: 1 }}
                      readOnly
                    />
                    <Typography component="span" variant="h5">
                      ({8})
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="h5" color="primary.main">
                      {"$" + 10}
                    </Typography>
                    <Typography variant="h6">/ course</Typography>
                  </Box>
                  <IconButton
                    color="primary"
                    sx={{
                      "&:hover": {
                        backgroundColor: "primary.main",
                        color: "primary.contrastText",
                      },
                    }}
                  >
                    <ArrowForward />
                  </IconButton>
                </Box>
              </Box>
            </Box>
            {/* <Slider {...sliderConfig}>
              {data.map((item) => (
                <CourseCardItem key={String(item.id)} item={item} />
              ))}
            </Slider> */}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePopularCourse;
