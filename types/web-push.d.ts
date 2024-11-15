declare module 'web-push' {
  export interface SendResult {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
  }

  export function setVapidDetails(
    subject: string,
    publicKey: string,
    privateKey: string
  ): void;

  export function sendNotification(
    subscription: any,
    payload?: string | Buffer,
    options?: any
  ): Promise<SendResult>;

  export function generateVAPIDKeys(): { publicKey: string; privateKey: string };
}
