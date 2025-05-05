import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

async function getLocationData(ip: string) {
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await response.json();
    return {
      country: data.country,
      city: data.city,
      latitude: data.lat,
      longitude: data.lon,
    };
  } catch (error) {
    console.error('Error fetching location data:', error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const headersList = headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";
    const referrer = headersList.get("referer") || "unknown";

    // Find the URL in the database
    const url = await prisma.url.findUnique({
      where: { slug },
    });

    if (!url) {
      return NextResponse.json(
        { error: "URL not found" },
        { status: 404 }
      );
    }

    // Get location data
    const locationData = await getLocationData(ip);

    // Record the click with location data
    await prisma.click.create({
      data: {
        urlId: url.id,
        ip,
        userAgent,
        referrer,
        country: locationData?.country,
      },
    });

    // Redirect to the original URL
    return NextResponse.redirect(url.original);
  } catch (error) {
    console.error("Error redirecting URL:", error);
    return NextResponse.json(
      { error: "Failed to redirect" },
      { status: 500 }
    );
  }
} 