'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscribeButton } from "@/components/subscription/subscribe-button";
import Link from "next/link";
import { CheckCircle } from 'lucide-react';

import { UserPlan } from "@prisma/client";

interface Plan {
  name: string;
  planId: UserPlan;
  amount: number;
  price: string;
  description: string;
  features: string[];
  cta: string;
  disabled: boolean;
  action?: React.ReactNode;
}

interface PricingPlansProps {
  userPlan: UserPlan;
}

export function PricingPlans({ userPlan }: PricingPlansProps) {
  const plans: Plan[] = [
    {
      name: "Free",
      price: "Rp 0",
      description: "Mulai belajar dasar-dasar bahasa Korea.",
      features: [
        "Akses terbatas ke Kursus",
        "Akses terbatas ke Latihan Soal",
        "Dukungan Komunitas",
      ],
      cta: "Paket Anda Saat Ini",
      disabled: true,
      planId: UserPlan.FREE,
      amount: 0,
    },
    {
      name: "Premium",
      planId: UserPlan.PREMIUM,
      amount: 250000,
      price: "Rp 250.000 / bulan",
      description: "Akses penuh ke semua materi dan fitur.",
      features: [
        "Akses ke semua Kursus",
        "Akses ke semua Latihan Soal",
        "Prioritas Dukungan",
        "Pengalaman Bebas Iklan",
        "Sertifikat Penyelesaian (opsional)",
      ],
      cta: "Upgrade ke Premium",
      disabled: userPlan === UserPlan.PREMIUM,
    },
    {
      name: "Custom",
      planId: UserPlan.CUSTOM,
      amount: 0,
      price: "Hubungi Kami",
      description: "Solusi belajar yang disesuaikan untuk grup atau perusahaan.",
      features: [
        "Kurikulum Kustom",
        "Sesi Pelatihan Langsung",
        "Pelaporan Kemajuan Tim",
        "Manajer Akun Khusus",
      ],
      cta: "Hubungi Sales",
      disabled: false,
      action: <Button asChild><Link href="/contact">Hubungi Kami</Link></Button>,
    },
  ];

  return (
    <div className="container mx-auto p-4 lg:p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Pilih Paket Langganan Anda</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.name} className={`flex flex-col ${plan.name === 'Premium' ? 'border-primary' : ''}`}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <p className="text-2xl font-semibold">{plan.price}</p>
              <ul className="space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {plan.name === 'Free' && userPlan === UserPlan.FREE ? (
                <Button variant="outline" disabled className="w-full">{plan.cta}</Button>
              ) : plan.disabled ? (
                <Button variant="outline" disabled className="w-full">Sudah Berlangganan</Button>
              ) : plan.name === 'Premium' ? (
                <div className="w-full">
                  <SubscribeButton planId={plan.planId} amount={plan.amount} planName={plan.name} />
                </div>
              ) : plan.action ? (
                <div className="w-full">
                  {plan.action}
                </div>
              ) : (
                <Button disabled={plan.disabled} className="w-full">{plan.cta}</Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
