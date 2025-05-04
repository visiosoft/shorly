import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/auth";
import { prisma } from "@/lib/prisma";
import { Url, Click } from "@prisma/client";

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

    // Calculate total clicks
    const totalClicks = urls.reduce((sum: number, url: Url & { clicks: Click[] }) => sum + url.clicks.length, 0);

    // Calculate unique visitors (based on IP)
    const uniqueVisitors = new Set(
      urls.flatMap((url: Url & { clicks: Click[] }) => url.clicks.map((click: Click) => click.ip))
    ).size;

    // Get clicks by day for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const clicksByDay = await prisma.click.groupBy({
      by: ["timestamp"],
      where: {
        url: {
          userId: session.user.email,
        },
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
        url: {
          userId: session.user.email,
        },
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
        url: {
          userId: session.user.email,
        },
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

    return NextResponse.json({
      totalClicks,
      uniqueVisitors,
      clicksByDay: formattedClicksByDay,
      clicksByCountry: formattedClicksByCountry,
      clicksByDevice: formattedClicksByDevice,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 