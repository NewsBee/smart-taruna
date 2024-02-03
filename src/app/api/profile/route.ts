import { NextResponse } from "next/server";

export const GET = async (req: any) => {
  //   const userData = {
  //     name: "Muhammad",
  //     avatar: "https://i.pravatar.cc/300",
  //     email: "arifinyahya@gmail.com",
  //     gender: "L",
  //     phoneNumber: "085753927878",
  //     education: "Pendidikan Terakhir",
  //     major: "Jurusan",
  //     institution: "Institusi / Kampus yang dituju",
  //     socialLinks: [
  //       { platform: "Facebook", link: "https://facebook.com/user" },
  //       // ... more links
  //     ],
  //   };
  
  const userProfile = {
    username: "Muhammad",
    email: "arifinyahya@gmail.com",
    phoneNumber: "085753927878",
    lastEducation: "Sarjana",
    major: "Teknik Informatika",
    destinationInstitution: "Universitas Teknologi",
    socialLinks: [
      { platform: "facebook", link: "https://facebook.com/muhammad" },
      { platform: "twitter", link: "https://twitter.com/muhammad" },
      { platform: "instagram", link: "https://instagram.com/muhammad" },
      // Tambahkan platform lain jika ada
    ],
    tryOutStats: {
      highestSKD: 121.0,
      averageSKD: 121.0,
      // Lanjutkan dengan data statistik lainnya...
    },
  };
//   console.log(userProfile);
  if (userProfile) {
    return NextResponse.json({ message:"Test", userProfile }, { status: 200 });
  } else {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
};
