import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth";
import { prisma } from "@/lib/prisma";
import { Url, Click } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the URL and verify ownership
    const url = await prisma.url.findFirst({
      where: {
        id: params.id,
        userId: session.user.email,
      },
      include: {
        clicks: true,
      },
    });

    if (!url) {
      return new NextResponse("URL not found", { status: 404 });
    }

    // Calculate total clicks
    const totalClicks = url.clicks.length;

    // Calculate unique visitors (based on IP)
    const uniqueVisitors = new Set(url.clicks.map((click) => click.ip)).size;

    // Get clicks by day for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const clicksByDay = await prisma.click.groupBy({
      by: ["timestamp"],
      where: {
        urlId: params.id,
        timestamp: {
          gte: thirtyDaysAgo,
        },
      },
      _count: true,
      orderBy: {
        timestamp: "asc",
      },
    });

    // Format clicks by day data
    const formattedClicksByDay = clicksByDay.map((day) => ({
      date: new Date(day.timestamp).toLocaleDateString(),
      clicks: day._count,
    }));

    // Get clicks by country (using IP as a proxy for country)
    const clicksByCountry = await prisma.click.groupBy({
      by: ["ip"],
      where: {
        urlId: params.id,
      },
      _count: true,
      orderBy: {
        _count: {
          ip: "desc",
        },
      },
      take: 10,
    });

    // Format clicks by country data
    const formattedClicksByCountry = clicksByCountry.map((country) => ({
      country: country.ip || "Unknown",
      clicks: country._count,
    }));

    // Get clicks by device
    const clicksByDevice = await prisma.click.groupBy({
      by: ["userAgent"],
      where: {
        urlId: params.id,
      },
      _count: true,
      orderBy: {
        _count: {
          userAgent: "desc",
        },
      },
      take: 5,
    });

    // Format clicks by device data
    const formattedClicksByDevice = clicksByDevice.map((device) => ({
      device: device.userAgent || "Unknown",
      clicks: device._count,
    }));

    // Get recent clicks
    const recentClicks = await prisma.click.findMany({
      where: {
        urlId: params.id,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: 50,
    });

    // Format recent clicks data
    const formattedRecentClicks = recentClicks.map((click) => ({
      timestamp: click.timestamp.toISOString(),
      ip: click.ip || "Unknown",
      userAgent: click.userAgent || "Unknown",
      referrer: click.referrer || "",
    }));

    return NextResponse.json({
      url: {
        slug: url.slug,
        original: url.original,
      },
      totalClicks,
      uniqueVisitors,
      clicksByDay: formattedClicksByDay,
      clicksByCountry: formattedClicksByCountry,
      clicksByDevice: formattedClicksByDevice,
      recentClicks: formattedRecentClicks,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 