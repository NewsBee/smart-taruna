import prismadb from "@/app/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = async (req: Request) => {
  const body = await req.json();
  const { id } = body;

  const existingPackage = await prismadb.package.findUnique({
    where: { id },
  });

  if(!existingPackage){
    return NextResponse.json({message: "Package not found"},{status:404});
  }

  // Lakukan penghapusan paket
  await prismadb.package.delete({
    where: { id },
  });

  return NextResponse.json({message: "Package successfully deleted"}, {status:200});
};
