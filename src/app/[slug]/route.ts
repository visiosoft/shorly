import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

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

    // Record the click
    await prisma.click.create({
      data: {
        urlId: url.id,
        ip,
        userAgent,
        referrer,
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