declare module '@farcaster/miniapp-sdk' {
  export class MiniAppClient {
    environment?: string;
    platform?: string;
    init?: () => Promise<void>;
    [key: string]: unknown;
  }
}
