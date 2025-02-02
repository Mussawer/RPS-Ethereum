import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from '@wagmi/core/chains'


export const config = getDefaultConfig({
    appName: 'RPS',
    projectId: 'YOUR_PROJECT_ID',
    chains: [sepolia],
    // ssr: true, // If your dApp uses server side rendering (SSR)
  });