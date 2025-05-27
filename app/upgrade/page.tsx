import { auth } from "@/auth";
import { PricingPlans } from "@/components/subscription/pricing-plans";
import { redirect } from "next/navigation";
import { UserPlan } from "@prisma/client";

export default async function UpgradePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/upgrade");
  }
  
  return <PricingPlans userPlan={session.user.plan || UserPlan.FREE} />;
}
