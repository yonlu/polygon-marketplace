import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Web3Modal from 'web3modal';
import Image from 'next/image';

import { nftaddress, nftmarketaddress } from '../config';

import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json';

import type { MarketItem, Metadata, LoadingState } from './types';

export default function Home() {
  const [nfts, setNfts] = useState<MarketItem[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('not-loaded');

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    const provider = new ethers.providers.JsonRpcProvider(
      'https://polygon-mumbai.infura.io/v3/c78604f5f7f044a4b18203dec1257f5b'
    );
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      provider
    );
    const data = await marketContract.fetchMarketItems();

    const items: MarketItem[] = await Promise.all(
      data.map(async (i: MarketItem) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const { data: metadata } = (await axios.get(tokenUri)) as {
          data: Metadata;
        };

        let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
        let item = {
          price,
          tokenId: i.tokenId,
          seller: i.seller,
          owner: i.owner,
          image: metadata.image,
          name: metadata.name,
          description: metadata.description,
        };
        return item;
      })
    );

    setNfts(items);
    setLoadingState('loaded');
  }

  async function buyNft(nft: MarketItem) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');

    const transaction = await contract.createMarketSale(
      nftaddress,
      nft.tokenId,
      {
        value: price,
      }
    );

    await transaction.wait();
    loadNFTs();
  }

  if (loadingState === 'loaded' && !nfts.length) {
    return <h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>;
  }

  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: '1600px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, i) => (
            <div key={i} className="border shadow rounded-xl overflow-hidden">
              <Image src={nft.image} width="438" height="246" alt="NFT Image" />
              <div className="p-4">
                <p
                  style={{ height: '64px' }}
                  className="text-2xl font-semibold"
                >
                  {nft.name}
                </p>
                <div style={{ height: '70px', overflow: 'hidden' }}>
                  <p className="text-gray-400">{nft.description}</p>
                </div>
              </div>
              <div className="p-4 bg-black">
                <p className="text-2xl mb-4 font-bold text-white">
                  {nft.price} Matic
                </p>
                <button
                  className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded"
                  onClick={() => buyNft(nft)}
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
