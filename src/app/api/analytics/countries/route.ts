import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get all URLs for the user
    const urls = await prisma.url.findMany({
      where: {
        userId: session.user.email,
      },
      include: {
        clicks: true,
      },
    });

    // Get clicks by country
    const clicksByCountry = await prisma.click.groupBy({
      by: ["country"],
      where: {
        url: {
          userId: session.user.email,
        },
        country: {
          not: null,
        },
      },
      _count: {
        country: true,
      },
      orderBy: {
        _count: {
          country: "desc",
        },
      },
    });

    // Format the data for the map
    const formattedData = clicksByCountry.map((country) => ({
      country: country.country || "Unknown",
      clicks: country._count.country,
    }));

    return NextResponse.json({
      totalClicks: formattedData.reduce((sum, item) => sum + item.clicks, 0),
      countries: formattedData,
    });
  } catch (error) {
    console.error("Error fetching country statistics:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 