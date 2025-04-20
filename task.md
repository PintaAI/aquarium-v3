# Midtrans Snap UI Integration Checklist

## Backend Setup
- [x] Install Midtrans Node.js library (`midtrans-client`)
- [x] Add Midtrans API Keys (Client, Server, Merchant ID) and environment flag to `.env.local`
- [x] Create API route for transaction creation (`app/api/midtrans/create-transaction/route.ts`)
  - [x] Implement logic to generate `order_id`
  - [x] Implement logic to call Midtrans API using Server Key to get transaction `token`
  - [x] Return `token` to frontend
- [x] Create API route for webhook notifications (`app/api/midtrans/notification/route.ts`)
  - [x] Implement logic to verify notification signature using Server Key
  - [x] Implement logic to parse notification payload
  - [x] Implement logic to update user plan to `PREMIUM` in database on successful payment (`settlement` or `capture`)
  - [x] Respond `200 OK` to Midtrans

## Frontend Integration
- [x] Create Subscription Button component (`components/subscription/subscribe-button.tsx`)
- [x] Include Midtrans Snap.js script (`https://app.sandbox.midtrans.com/snap/snap.js`) in the relevant layout/page
- [x] Implement logic in Subscription Button component:
  - [x] Fetch transaction `token` from `/api/midtrans/create-transaction` endpoint on button click
  - [x] Call `window.snap.pay(token, { ...callbacks })` using the fetched token and Client Key
  - [x] Implement Snap UI callbacks (`onSuccess`, `onPending`, `onError`, `onClose`) for user feedback

## Database (Optional but Recommended)
- [x] Add `Subscription` model to `prisma/schema.prisma`
- [x] Add relation from `User` to `Subscription`
- [x] Run `prisma generate`
- [x] Run `prisma migrate dev` (or appropriate migration command)
- [x] Update API routes (`create-transaction`, `notification`) to create/update `Subscription` records

## Midtrans Dashboard Configuration
- [ ] Set "Payment Notification URL" in Midtrans Sandbox Dashboard settings to the deployed webhook endpoint (`/api/midtrans/notification`)

## Testing
- [ ] Test subscription flow in Sandbox environment
- [ ] Verify user plan updates correctly after successful payment
- [ ] Verify webhook endpoint handles notifications correctly
