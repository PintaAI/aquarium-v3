import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { sendNotification } from '../../../lib/send-notification';

export function POST(req: NextRequest) {
  sendNotification();
  return NextResponse.json({ message: 'Notification sent successfully.' });
}
