// components/dashboard/CertificateEligibilityToggle.tsx
"use client";

import { useState, useTransition } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { updateCertificateEligibility } from '@/app/actions/user-actions';
import { toast } from 'sonner'; // Using sonner for toast notifications

interface CertificateEligibilityToggleProps {
  userId: string;
  isInitiallyEligible: boolean;
}

export function CertificateEligibilityToggle({
  userId,
  isInitiallyEligible,
}: CertificateEligibilityToggleProps) {
  const [isPending, startTransition] = useTransition();
  // Use the initial prop value for the state
  const [isEligible, setIsEligible] = useState(isInitiallyEligible);

  const handleChange = (checked: boolean | 'indeterminate') => {
    // Checkbox returns boolean or 'indeterminate', we only care about boolean
    if (typeof checked === 'boolean') {
      // Optimistically update UI state *before* starting transition
      setIsEligible(checked);

      startTransition(async () => {
        const result = await updateCertificateEligibility(userId, checked);
        if (!result.success) {
          // Revert optimistic update on error
          setIsEligible(!checked);
          toast.error(result.error || "Failed to update eligibility.");
        } else {
           // Optionally show success toast, or just rely on revalidation
           // toast.success("User eligibility updated.");
        }
      });
    }
  };

  return (
    <Checkbox
      checked={isEligible}
      onCheckedChange={handleChange}
      disabled={isPending}
      aria-label={`Mark user ${userId} as ${isEligible ? 'ineligible' : 'eligible'} for certificate`}
    />
  );
}
