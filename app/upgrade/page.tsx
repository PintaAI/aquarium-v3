import React from 'react'; // <--- Added React import
import { auth } from "@/auth"; // <--- Removed duplicate import
import { SubscribeButton } from "@/components/subscription/subscribe-button";
import { Button } from "@/components/ui/button"; // Import Button for Contact Us
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link"; // Import Link for Contact Us
import { redirect } from "next/navigation";
import { CheckCircle } from 'lucide-react'; // Icon for features

export default async function UpgradePage() {
  const session = await auth();

  // Redirect to login if user is not authenticated
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/upgrade"); // Redirect back after login
  }

  // Optional: Check if user is already premium and display different content
  // const user = await db.user.findUnique({ where: { id: session.user.id } });
  // if (user?.plan === 'PREMIUM') {
  //   return (
  //     <div className="container mx-auto p-4">
  //       <Card>
  //         <CardHeader>
  //           <CardTitle>Plan Premium</CardTitle>
  //           <CardDescription>Anda sudah berlangganan paket Premium.</CardDescription>
  //         </CardHeader>
  //         <CardContent>
  //           <p>Terima kasih telah mendukung Pejuangkorea!</p>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }

  // Placeholder function to get user's current plan (replace with actual logic)
  const getCurrentUserPlan = async (userId: string | undefined): Promise<string> => {
    // In a real app, fetch this from your database based on userId
    // Example: const user = await db.user.findUnique({ where: { id: userId }, select: { plan: true } }); return user?.plan || 'FREE';
    if (!userId) return 'FREE';
    // For now, assume FREE if logged in, otherwise handled by redirect
    return 'FREE'; // Replace with actual DB lookup
  };

  const userPlan = await getCurrentUserPlan(session?.user?.id);

  const plans = [
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
      planId: "FREE", // Add planId for consistency if needed elsewhere
      amount: 0,
    },
    {
      name: "Premium",
      planId: "PREMIUM", // Define a plan ID
      amount: 250000, // Define the amount numerically (IDR)
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
      disabled: userPlan === 'PREMIUM', // Disable if already premium
      // We will define the action dynamically inside the map loop below
      action: null, // Set to null or a placeholder here
    },
    {
      name: "Custom",
      planId: "CUSTOM", // Add planId
      amount: 0, // Or a specific amount if applicable for contact initiation
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
      action: <Button asChild><Link href="/contact">Hubungi Kami</Link></Button>, // Link to a contact page (create one if needed)
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
              {plan.name === 'Free' && userPlan === 'FREE' ? (
                 <Button variant="outline" disabled className="w-full">{plan.cta}</Button>
              ) : plan.disabled ? ( // Check if the plan itself should be disabled (e.g., already subscribed)
                <Button variant="outline" disabled className="w-full">Sudah Berlangganan</Button> // Show disabled state
              ) : plan.name === 'Premium' ? ( // Specifically render SubscribeButton for Premium plan here
                 <div className="w-full">
                   <SubscribeButton planId={plan.planId} amount={plan.amount} planName={plan.name} />
                 </div>
              ) : plan.action ? ( // Render other actions defined in the plan object (like for Custom)
                <div className="w-full">
                  {plan.action}
                </div>
              ) : ( // Fallback for plans without specific action components (shouldn't happen with current setup)
                 <Button disabled={plan.disabled} className="w-full">{plan.cta}</Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div> // <--- Added missing closing div
  );
}
