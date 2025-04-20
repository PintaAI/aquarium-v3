import { auth } from "@/auth";
import { SubscribeButton } from "@/components/subscription/subscribe-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

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

  return (
    <div className="container mx-auto p-4 flex justify-center items-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Upgrade ke Premium</CardTitle>
          <CardDescription>
            Dapatkan akses penuh ke semua fitur Pejuangkorea.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Dengan berlangganan Premium, Anda akan mendapatkan:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Akses ke semua Kursus</li>
            <li>Akses ke semua Latihan Soal</li>
            <li>Prioritas Dukungan</li>
            <li>Pengalaman Bebas Iklan (jika ada)</li>
            {/* Add more benefits */}
          </ul>
          <div className="text-center pt-4">
             {/* TODO: Display actual price dynamically */}
            <p className="text-lg font-semibold mb-4">Hanya Rp 100.000 / bulan</p>
            <SubscribeButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
