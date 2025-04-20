'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'; // Assuming you use Shadcn UI Button
import { useToast } from '@/hooks/use-toast'; // Assuming you have a toast hook
import { Loader2 } from 'lucide-react';

// Define the type for the Snap window object if not already globally defined
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
  // language?: string;
}

interface Snap {
  pay(token: string, options?: SnapOptions): void;
}

declare global {
  interface Window {
    snap?: Snap; // Use the defined Snap interface, make it optional
  }
}

export function SubscribeButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [isSnapScriptLoaded, setIsSnapScriptLoaded] = useState(false);

  // Check if Snap script is loaded (can be improved with better state management)
  useEffect(() => {
    // Simple check if the snap object exists
    if (window.snap) {
      setIsSnapScriptLoaded(true);
    }
    // More robust check might involve listening to script load events
  }, []);


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
      // 1. Fetch the transaction token from your backend API
      const response = await fetch('/api/midtrans/create-transaction', {
        method: 'POST',
        // Add headers if needed, e.g., for content type or auth
        // headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify({ plan: 'PREMIUM' }) // Send plan details if needed
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

      // 2. Use the token to open the Snap payment popup
      // Check if window.snap exists before calling pay
      if (!window.snap) {
        throw new Error('Midtrans Snap script not loaded correctly.');
      }
      window.snap.pay(token, {
        onSuccess: function (result: SnapSuccessResult) {
          /* You may add your own implementation here */
          console.log('Payment Success:', result);
          toast({
            title: 'Payment Successful!',
            description: 'Your subscription has been activated.',
          });
          // Optionally redirect or update UI state
          // window.location.href = '/dashboard'; // Example redirect
        },
        onPending: function (result: SnapPendingResult) {
          /* You may add your own implementation here */
          console.log('Payment Pending:', result);
          toast({
            title: 'Payment Pending',
            description: 'Waiting for payment confirmation.',
          });
        },
        onError: function (result: SnapErrorResult) {
          /* You may add your own implementation here */
          console.error('Payment Error:', result);
          toast({
            title: 'Payment Error',
            description: 'An error occurred during payment. Please try again.',
            variant: 'destructive',
          });
        },
        onClose: function () {
          /* You may add your own implementation here */
          console.log('Payment popup closed');
          // Customer closed the popup without finishing the payment
          // Optionally show a message or do nothing
        }
      });

    } catch (error) {
      console.error('Subscription Error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleSubscribe} disabled={isLoading || !isSnapScriptLoaded}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        'Upgrade to Premium'
      )}
    </Button>
  );
}
