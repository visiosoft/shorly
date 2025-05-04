import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // First get the user to get their ID
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Verify URL ownership using the user's ID
    const url = await prisma.url.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!url) {
      return new NextResponse("URL not found", { status: 404 });
    }

    // Delete the URL and its associated clicks
    await prisma.url.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting URL:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 