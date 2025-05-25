'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'; // Import VisuallyHidden
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'; // Import Dialog components including DialogTitle
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// Define the type for the Snap window object
// Define interfaces for Midtrans Snap and its callback results
interface SnapSuccessResult {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  fraud_status: string;
  pdf_url?: string;
  finish_redirect_url?: string;
}

interface SnapPendingResult {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  fraud_status: string;
  pdf_url?: string;
  finish_redirect_url?: string;
}

interface SnapErrorResult {
  status_code: string;
  status_message: string; // Contains error messages
}

interface SnapOptions {
  onSuccess?(result: SnapSuccessResult): void;
  onPending?(result: SnapPendingResult): void;
  onError?(result: SnapErrorResult): void;
  onClose?(): void;
  // embedId?: string; // Example: Add other options if you use them
  language?: string; // Add language option
  embedId?: string; // Add embedId for embed mode

}

interface Snap {
  pay(token: string, options?: SnapOptions): void;
  embed(token: string, options: SnapOptions & { embedId: string }): void;
  hide(): void; // Add hide method signature
}

declare global {
  interface Window {
    snap?: Snap; // Use the defined Snap interface, make it optional
  }
}

// Define props for the button
import { UserPlan } from "@prisma/client";

interface SubscribeButtonProps {
  planId: UserPlan;
  amount: number; // Amount in the smallest currency unit (e.g., IDR)
  planName: string; // For display purposes in messages/logs
}

export function SubscribeButton({ planId, amount, planName }: SubscribeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // State for Dialog
  const [transactionToken, setTransactionToken] = useState<string | null>(null); // State for the token
  const { toast } = useToast();
  const router = useRouter(); // Initialize router
  const [isSnapScriptLoaded, setIsSnapScriptLoaded] = useState(false);

  // Check if Snap script is loaded
  useEffect(() => {
    // Simple check if the snap object exists
    if (window.snap) {
      setIsSnapScriptLoaded(true);
    }
    // More robust check might involve listening to script load events
  }, []);

  // Effect to embed Snap when dialog opens and token is ready
  useEffect(() => {
    // Only run if dialog is open, token exists, and snap is loaded
    if (isOpen && transactionToken && window.snap) {
      const embedSnap = () => {
        window.snap?.embed(transactionToken, {
          embedId: 'snap-container',
          language: 'id',
          onSuccess: () => {
            toast({ title: 'Sukses!', description: `Langganan ${planName} aktif.` });
            setIsOpen(false);
            setTransactionToken(null); // Clear token
            router.push('/profile'); // Redirect to profile page after success
          },
          onPending: () => {
            toast({ title: 'Menunggu', description: 'Menunggu pembayaran dikonfirmasi.' });
            // Keep dialog open during pending
          },
          onError: () => {
            toast({ title: 'Error', description: 'Pembayaran gagal.', variant: 'destructive' });
            setIsOpen(false);
            setTransactionToken(null); // Clear token
          },
          onClose: () => {
            // User closed the embed UI prematurely
            // NOTE: This callback may not fire for all internal close actions in embed mode.
            setIsOpen(false);
            setTransactionToken(null); // Clear token
          }
        });
      };
      // Slight delay might still be needed if the container isn't ready immediately after isOpen=true
      const timer = setTimeout(embedSnap, 100); // Shorter delay, adjust if needed

      // Cleanup function for the effect
      return () => {
        clearTimeout(timer);
        // Attempt to hide Snap UI if the effect cleans up while dialog might still be considered open
        // This is less critical now with the onOpenChange handler, but good practice
        // window.snap?.hide();
      };
    }
  }, [isOpen, transactionToken, planName, router, toast]); // Dependencies


  const handleSubscribe = async () => {
    if (!isSnapScriptLoaded) {
      toast({
        title: 'Error',
        description: 'Payment script not loaded yet. Please wait a moment and try again.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // 1. Fetch the transaction token from your backend API, sending plan details
      const response = await fetch('/api/midtrans/create-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId, amount, planName }), // Send plan details
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to create transaction: ${response.status} ${errorData}`);
      }

      const data = await response.json();
      const token = data.token;

      if (!token) {
        throw new Error('Transaction token not received from server.');
      }

      // 2. Store the token and open the dialog. The useEffect will handle embedding.
      setTransactionToken(token);
      setIsOpen(true);

    } catch (error) {
      setTransactionToken(null); // Clear token on error
      toast({
        title: 'Gagal',
        description: error instanceof Error ? error.message : 'Gagal memulai transaksi.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleSubscribe} disabled={isLoading || !isSnapScriptLoaded}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Upgrade to ${planName}` // Use dynamic plan name
        )}
      </Button>

      {/* Dialog component */}
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open); // Update dialog state based on external interaction (click outside, etc.)
        if (!open) {
          // If dialog is closing externally, clear token and try to hide Snap UI
          setTransactionToken(null);
          window.snap?.hide(); // Attempt to hide/cleanup Snap UI
        }
      }}>
        <DialogContent className="max-w-md p-0 border-none">
          <VisuallyHidden>
            <DialogTitle>Payment Gateway</DialogTitle>
          </VisuallyHidden>
          {/* Container for Midtrans Snap Embed */}
          <div id="snap-container" className="w-full h-screen md:h-[800px]" />
        </DialogContent>
      </Dialog>
    </>
  );
}
