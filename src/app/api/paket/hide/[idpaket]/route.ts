import prismadb from "@/app/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";

export const PUT = async (
  req: NextRequest,
  context: { params: { idpaket: any } }
) => {
  const packageId = context.params.idpaket;
  const { isHidden } = await req.json(); // Menggunakan isHidden sebagai payload

  try {
    const packageData = await prismadb.package.update({
      where: { id: Number(packageId) },
      data: { isHidden }, // Mengupdate isHidden bukan isLocked
    });
    return NextResponse.json({ message: 'Package visibility updated successfully', packageData }, {status:200});
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update package visibility', error }, {status:500});
  }
};
