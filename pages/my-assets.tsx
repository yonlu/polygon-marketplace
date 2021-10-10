import { Flex, Grid, GridItem, LinkBox } from '@chakra-ui/react';
import Link from 'next/link';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Web3Modal from 'web3modal';

import { nftaddress, nftmarketaddress } from '../config';

import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json';

import { NFT as NFTCard } from '../components/NFT';

import type { MarketItem, Metadata, LoadingState } from './types';

export default function MyAssets() {
  const [nfts, setNfts] = useState<MarketItem[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('not-loaded');

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer
    );
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const data = await marketContract.fetchMyNFTs();
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
          contractName: tokenContractName,
        };
        return item;
      })
    );

    setNfts(items);
    setLoadingState('loaded');
  }

  if (loadingState === 'loaded' && !nfts.length)
    return <h1 className="py-10 px-20 text-3xl">No assets owned</h1>;

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
          </GridItem>
        ))}
      </Grid>
    </Flex>
  );
}
