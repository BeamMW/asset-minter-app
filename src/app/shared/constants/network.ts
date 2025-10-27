export type Network = 'mainnet' | 'dappnet';

export interface NetworkConfig {
  name: string;
  blockTimeMs: number;
  cid: string;
  blackholeCid: string;
  currencies: Array<{
    name: string;
    rate_id: string;
    id: number;
    decimals: number;
    fee_decimals: number;
    validator_dec: number;
    cid: string;
  }>;
}

export const NETWORKS: Record<Network, NetworkConfig> = {
  mainnet: {
    name: 'mainnet',
    blockTimeMs: 60000, // 60 seconds
    cid: '295fe749dc12c55213d1bd16ced174dc8780c020f59cb17749e900bb0c15d868',
    blackholeCid: '5ab408982b148210e88f180114f10222a2235eafeede0a3a224fda0e523e17b7',
    currencies: [
      {
        name: 'bUSDT',
        rate_id: 'tether',
        id: 1,
        decimals: 8,
        fee_decimals: 6,
        validator_dec: 6,
        cid: '3c57dd78336b088866991ceb8cd9a69d5803103db03fbe5f93f4caed839e6fe3'
      },
      {
        name: 'bETH',
        rate_id: 'ethereum',
        id: 2,
        decimals: 8,
        fee_decimals: 8,
        validator_dec: 8,
        cid: 'bccf872d60ccae278d34a3bf411f7e5f0dd30cdb10edf2c0aef6d65f8f59db0a'
      },
      {
        name: 'bDAI',
        rate_id: 'dai',
        id: 3,
        decimals: 8,
        fee_decimals: 8,
        validator_dec: 8,
        cid: 'cb61fd142d3ef1176a586a8e1d6bf87321134d6881b812d9783380b70400e598'
      },
      {
        name: 'bWBTC',
        rate_id: 'wrapped-bitcoin',
        id: 4,
        decimals: 8,
        fee_decimals: 8,
        validator_dec: 6,
        cid: 'a17951f325d440d32f728f84467d69fd13793e426d1fc8903a620a7edf6cabf1'
      }
    ]
  },
  dappnet: {
    name: 'dappnet',
    blockTimeMs: 15000, // 15 seconds
    cid: '518b02202c05623f50b0c75efd900afdbb571f3e68c7a1dce7117d821f5ff6f0',
    blackholeCid: '5ab408982b148210e88f180114f10222a2235eafeede0a3a224fda0e523e17b7',
    currencies: [
      {
        name: 'bUSDT',
        rate_id: 'tether',
        id: 1,
        decimals: 8,
        fee_decimals: 6,
        validator_dec: 6,
        cid: '3c57dd78336b088866991ceb8cd9a69d5803103db03fbe5f93f4caed839e6fe3'
      },
      {
        name: 'bETH',
        rate_id: 'ethereum',
        id: 2,
        decimals: 8,
        fee_decimals: 8,
        validator_dec: 8,
        cid: 'bccf872d60ccae278d34a3bf411f7e5f0dd30cdb10edf2c0aef6d65f8f59db0a'
      },
      {
        name: 'bDAI',
        rate_id: 'dai',
        id: 3,
        decimals: 8,
        fee_decimals: 8,
        validator_dec: 8,
        cid: 'cb61fd142d3ef1176a586a8e1d6bf87321134d6881b812d9783380b70400e598'
      },
      {
        name: 'bWBTC',
        rate_id: 'wrapped-bitcoin',
        id: 4,
        decimals: 8,
        fee_decimals: 8,
        validator_dec: 6,
        cid: 'a17951f325d440d32f728f84467d69fd13793e426d1fc8903a620a7edf6cabf1'
      }
    ]
  }
};

// Change this to switch networks
export const CURRENT_NETWORK: Network = 'dappnet';

export const getCurrentNetworkConfig = (): NetworkConfig => {
  return NETWORKS[CURRENT_NETWORK];
};

// Convenience exports for backward compatibility
export const CID = getCurrentNetworkConfig().cid;
export const Blackhole_CID = getCurrentNetworkConfig().blackholeCid;
export const CURRENCIES = getCurrentNetworkConfig().currencies;
export const BLOCK_TIME_MS = getCurrentNetworkConfig().blockTimeMs;
