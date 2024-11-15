import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';

// Simpan subscription di database atau storage
const subscriptions: any[] = [];

export function POST(req: NextApiRequest) {
  const subscription = req.body;
  subscriptions.push(subscription);
  console.log('Subscription received:', subscription);
  return NextResponse.json({ message: 'Subscription saved successfully.' });
}
