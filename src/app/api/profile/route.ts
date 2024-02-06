import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prismadb from "@/app/lib/prismadb";

export const GET = async (req: any) => {
  const session = await getServerSession(authOptions);

  // Jika tidak ada session atau email user dalam session adalah null atau undefined,
  // kembalikan respons Unauthorized
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Karena sudah dicek di atas, kita bisa asumsikan email adalah string
  const email = session.user.email;

  try {
    const user = await prismadb.user.findUnique({
      where: { email: email },
      include: {
        socialLinks: true, // Pastikan relasi ini sudah disetup di model Prisma Anda
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userId = parseInt(session.user.id, 10);
    const lastAttempts = await prismadb.attempt.findMany({
      where: {
        userId: userId,
        Package: {
          Test: {
            name: "SKD",
          },
        },
      },
      include: {
        Package: true, // Include data paket untuk mendapatkan nama paket
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 4,
    });

    const lastAttemptsTPA = await prismadb.attempt.findMany({
        where: {
          userId: userId,
          Package: {
            Test: {
              name: "TPA",
            },
          },
        },
        include: {
          Package: true, // Include data paket untuk mendapatkan nama paket
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 4,
      });

    // Membuat objek untuk menyimpan hasil perhitungan
    const tryOutStatsSKD = [];
    const tryOutStatsTPA = [];

    for (const attempt of lastAttemptsTPA) {
        const { packageId, Package } = attempt;
  
        // Query untuk mendapatkan semua attempt yang terkait dengan paket ini oleh semua pengguna
        const relatedAttempts = await prismadb.attempt.findMany({
          where: {
            packageId: packageId,
          },
          select: {
            score: true,
          },
        });
  
        // Menghitung skor tertinggi dan rata-rata
        const highestSKD = Math.max(
          ...relatedAttempts.map((attempt) => attempt.score || 0)
        );
        const averageSKD =
          relatedAttempts.reduce((acc, cur) => acc + (cur.score || 0), 0) /
          relatedAttempts.length;
  
        tryOutStatsTPA.push({
          name: Package.title, // Gunakan judul paket sebagai nama
          highestSKD,
          averageSKD,
        });
      }

    // Untuk setiap attempt, hitung skor tertinggi dan rata-rata
    for (const attempt of lastAttempts) {
      const { packageId, Package } = attempt;

      // Query untuk mendapatkan semua attempt yang terkait dengan paket ini oleh semua pengguna
      const relatedAttempts = await prismadb.attempt.findMany({
        where: {
          packageId: packageId,
        },
        select: {
          score: true,
        },
      });

      // Menghitung skor tertinggi dan rata-rata
      const highestSKD = Math.max(
        ...relatedAttempts.map((attempt) => attempt.score || 0)
      );
      const averageSKD =
        relatedAttempts.reduce((acc, cur) => acc + (cur.score || 0), 0) /
        relatedAttempts.length;

      tryOutStatsSKD.push({
        name: Package.title, // Gunakan judul paket sebagai nama
        highestSKD,
        averageSKD,
      });
    }

    const userProfile = {
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      lastEducation: user.education,
      major: user.major,
      destinationInstitution: user.institution,
      socialLinks: user.socialLinks,
      avatar: user.profileImage,
      tryOutStatsSKD: tryOutStatsSKD,
      tryOutStatsTPA: tryOutStatsTPA,
      // Tambahkan data lainnya jika perlu
    };

    return NextResponse.json({ userProfile }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const POST = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  const body = await req.json();
  const {
    username,
    phoneNumber,
    lastEducation,
    major,
    destinationInstitution,
  } = body;
  // Jika tidak ada session atau email user dalam session adalah null atau undefined,
  // kembalikan respons Unauthorized
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const email = session.user.email;
    const updatedUser = await prismadb.user.update({
      where: { email },
      data: {
        username,
        phoneNumber,
        education: lastEducation,
        major,
        institution: destinationInstitution,
      },
    });

    return NextResponse.json(
      { message: "Profile updated successfully", updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
