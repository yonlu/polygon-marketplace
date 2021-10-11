export interface MarketItem {
  price: string;
  tokenId: number;
  seller: string;
  owner: string;
  image: string;
  name: string;
  description: string;
  sold?: boolean;
  contractName: string;
}

export interface Metadata {
  name: string;
  description: string;
  image: string;
}

export type LoadingState = 'loaded' | 'not-loaded';
