import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { id, email, username } = await req.json();

    if (!id || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const user = await prisma.user.upsert({
      where: { id },
      update: { email, username },
      create: {
        id,
        email,
        username: username || email.split('@')[0] || `user_${id.slice(0, 8)}`,
      },
    });

    console.log('[/api/users/create] User created:', user.id);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('[/api/users/create] error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}