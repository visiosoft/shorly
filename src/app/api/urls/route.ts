import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

    // Then query URLs using the user's ID
    const urls = await prisma.url.findMany({
      where: {
        userId: user.id,
      },
      include: {
        _count: {
          select: {
            clicks: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedUrls = urls.map((url) => ({
      id: url.id,
      slug: url.slug,
      original: url.original,
      clicks: url._count.clicks,
      createdAt: url.createdAt,
    }));

    return NextResponse.json(formattedUrls);
  } catch (error) {
    console.error("Error fetching URLs:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 