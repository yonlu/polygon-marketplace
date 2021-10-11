import { Flex, Grid, GridItem, LinkBox, Button } from '@chakra-ui/react';
import Link from 'next/link';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Web3Modal from 'web3modal';

import { nftaddress, nftmarketaddress } from '../config';

import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json';

import { NFT as NFTCard } from '../components/NFT';

import type { MarketItem, Metadata, LoadingState } from '../types/_types';

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
    const tokenContractName = await tokenContract.name();

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
          contractName: tokenContractName,
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
    <Flex justify="center" p={4}>
      <Grid templateColumns="repeat(3, 1fr)" gap={4}>
        {nfts.map((nft, i) => (
          <GridItem key={i}>
            <Link href={`/${nft.tokenId}`} passHref>
              <LinkBox as="a">
                <NFTCard
                  image={nft.image}
                  name={nft.name}
                  price={nft.price}
                  tokenId={nft.tokenId}
                  contractName={nft.contractName}
                />
              </LinkBox>
            </Link>
            <Button w="100%" onClick={() => buyNft(nft)}>
              Buy now
            </Button>
          </GridItem>
        ))}
      </Grid>
    </Flex>
  );
}
