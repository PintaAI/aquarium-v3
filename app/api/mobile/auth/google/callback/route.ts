import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

const client = new OAuth2Client('1085407842332-6jt7i5cn8scfc5bc2emb1juaqh6uv5ol.apps.googleusercontent.com');

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: '1085407842332-6jt7i5cn8scfc5bc2emb1juaqh6uv5ol.apps.googleusercontent.com',
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid Google ID token' },
        { status: 401 }
      );
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return NextResponse.json(
        { error: 'Email not provided by Google' },
        { status: 400 }
      );
    }

    // Check if account already exists with this Google ID
    const existingAccount = await db.account.findFirst({
      where: {
        provider: 'google',
        providerAccountId: googleId,
      },
      include: {
        user: true,
      },
    });

    let user;

    if (existingAccount) {
      // User already has Google account linked
      user = existingAccount.user;
    } else {
      // Check if user exists by email
      const existingUser = await db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // Link Google account to existing user
        await db.account.create({
          data: {
            userId: existingUser.id,
            type: 'oauth',
            provider: 'google',
            providerAccountId: googleId,
            access_token: '',
            token_type: 'Bearer',
          },
        });
        user = existingUser;
      } else {
        // Create new user and link Google account
        user = await db.user.create({
          data: {
            email,
            name: name || '',
            emailVerified: new Date(),
            image: picture,
          },
        });

        await db.account.create({
          data: {
            userId: user.id,
            type: 'oauth',
            provider: 'google',
            providerAccountId: googleId,
            access_token: '',
            token_type: 'Bearer',
          },
        });
      }
    }

    // Generate JWT token for mobile app
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
      },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
        image: user.image,
      },
    });

  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
