import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../lib/prisma';
import { authOptions } from '../../../auth/[...nextauth]';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const url = await prisma.url.findUnique({ where: { id: params.id }, include: { clicks: true } });
  if (!url) {
    return NextResponse.json({ error: 'URL not found' }, { status: 404 });
  }
  // Group clicks by date
  const analytics: Record<string, number> = {};
  url.clicks.forEach(click => {
    const date = click.timestamp.toISOString().split('T')[0];
    analytics[date] = (analytics[date] || 0) + 1;
  });
  return NextResponse.json({ total: url.clicks.length, byDate: analytics });
} 