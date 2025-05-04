import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../lib/prisma';
import { nanoid } from 'nanoid';
import { authOptions } from '../../../auth/[...nextauth]';
import { headers } from "next/headers";

const GUEST_URL_LIMIT = 3;

export async function POST(req: NextRequest) {
  try {
    const { original, slug } = await req.json();
    const session = await getServerSession(authOptions);
    const headersList = headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";

    // If user is not logged in, check IP-based limit
    if (!session?.user) {
      const ipUsage = await prisma.ipUsage.upsert({
        where: { ip },
        update: {
          count: { increment: 1 },
          lastReset: new Date(),
        },
        create: {
          ip,
          count: 1,
          lastReset: new Date(),
        },
      });

      // Check if IP has exceeded the limit
      if (ipUsage.count > GUEST_URL_LIMIT) {
        return NextResponse.json(
          { error: "IP_LIMIT_EXCEEDED" },
          { status: 403 }
        );
      }
    }

    // Generate or use provided slug
    const finalSlug = slug || nanoid(6);
    
    // Check if slug exists
    const exists = await prisma.url.findUnique({ where: { slug: finalSlug } });
    if (exists) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      );
    }

    // Create URL
    const url = await prisma.url.create({
      data: {
        original,
        slug: finalSlug,
        userId: session?.user ? (await prisma.user.findUnique({ where: { email: session.user.email } }))?.id : null,
      },
    });

    const shortUrl = `${req.nextUrl.origin}/${url.slug}`;
    return NextResponse.json({ shortUrl });
  } catch (error: any) {
    console.error("Error shortening URL:", error);
    return NextResponse.json(
      { error: error.message || "Failed to shorten URL" },
      { status: 500 }
    );
  }
} 