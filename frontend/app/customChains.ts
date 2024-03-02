import { type Chain } from "viem";

export const fhenix_testnet: Chain = {
    id: 42069,
    name: "Fhenix",
    nativeCurrency: {
        decimals: 18,
        name: "Avalanche",
        symbol: "AVAX",
    },
    rpcUrls: {
        default: { http: ["https://api.avax.network/ext/bc/C/rpc"] },
    },
    blockExplorers: {
        default: { name: "SnowTrace", url: "https://snowtrace.io" },
        snowtrace: { name: "SnowTrace", url: "https://snowtrace.io" },
    },
    testnet: false,
};