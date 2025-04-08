import { SignJWT } from 'jose';
import { auth } from "@/auth";
import { NextResponse } from 'next/server';

const apiSecret = "vd94p99jkwvcs6dkgyjghse8c3m3fqhucvd2g66tedrg48d43wyjkg2hakwb9ue7";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create the JWT token
    const token = await new SignJWT({ 
      user_id: session.user.id,
      name: session.user.name || undefined,
      image: session.user.image || undefined
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(new TextEncoder().encode(apiSecret));

    return NextResponse.json({ 
      token,
      user: {
        id: session.user.id,
        name: session.user.name,
        image: session.user.image
      }
    });
  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
