import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';
import { sendNotification } from '../../../lib/send-notification';

export function POST(req: NextApiRequest) {
  sendNotification();
  return NextResponse.json({ message: 'Notification sent successfully.' });
}
