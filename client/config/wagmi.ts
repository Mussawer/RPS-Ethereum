import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from '@wagmi/core';
import { sepolia } from '@wagmi/core/chains'


export const config = getDefaultConfig({
    appName: 'RPS',
    projectId: '1de775ecb762c7546d5e82c110b801f9',
    transports:{
      [sepolia.id]: http('https://sepolia.drpc.org') //
    },
    chains: [sepolia],
    // ssr: true, // If your dApp uses server side rendering (SSR)
  });