import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const url = await prisma.url.findUnique({ where: { slug: params.slug } });
  if (!url) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  // Log the click
  const ip = req.headers.get('x-forwarded-for') || '';
  await prisma.click.create({
    data: {
      urlId: url.id,
      ip,
      userAgent: req.headers.get('user-agent') || '',
      referrer: req.headers.get('referer') || '',
    },
  });
  return NextResponse.json({ original: url.original });
} 