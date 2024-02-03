import prismadb from "@/app/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";

export const PUT = async (
  req: NextRequest,
  context: { params: { idpaket: any } }
) => {
  const packageId = context.params.idpaket;
  const { isLocked } = await req.json();

  try {
    const packageData = await prismadb.package.update({
        where: { id: Number(packageId) },
        data: { isLocked },
      });
      return NextResponse.json({ message:'Package lock status updated successfully', packageData }, {status:200})
    } catch (error) {
      return NextResponse.json({ message:'Failed to update package lock status', error  }, {status:500})

  }
};
