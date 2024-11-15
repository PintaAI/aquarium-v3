import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Simpan subscription di database atau storage
const subscriptions: any[] = [];

export function POST(req: NextRequest) {
  const subscription = req.body;
  subscriptions.push(subscription);
  console.log('Subscription received:', subscription);
  return NextResponse.json({ message: 'Subscription saved successfully.' });
}
