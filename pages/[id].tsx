import {
  Avatar,
  AvatarBadge,
  AvatarGroup,
  Button,
  Flex,
  Grid,
  GridItem,
  Link,
  LinkBox,
  Text,
  VStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import axios from 'axios';

import { nftaddress, nftmarketaddress } from '../config';

import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json';

import { NFT as NFTCard } from '../components/NFT';

import type { MarketItem, Metadata, LoadingState } from './types';

export default function Token({ id }) {
  const [nfts, setNfts] = useState<MarketItem[]>([]);

  useEffect(() => {
    loadNFT(id);
  }, []);

  async function loadNFT(id) {
    const provider = new ethers.providers.JsonRpcProvider();
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      provider
    );
    const data = await marketContract.fetchMarketItem(id);
    const tokenContractName = await tokenContract.name();

    const tokenUri = await tokenContract.tokenURI(data.tokenId);
    const { data: metadata } = (await axios.get(tokenUri)) as {
      data: Metadata;
    };
    const price = ethers.utils.formatUnits(data.price.toString(), 'ether');

    const item = {
      price,
      tokenId: data.tokenId.toString(),
      seller: data.seller,
      owner: data.owner,
      image: metadata.image,
      name: metadata.name,
      description: metadata.description,
      contractName: tokenContractName,
    };

    setNfts([item]);
  }

  function formatAddress(address: string) {
    if (address.length >= 42) {
      const shortAddress = address.slice(0, 11) + '...' + address.slice(38, 42);
      return shortAddress;
    } else {
      return '0';
    }
  }

  return (
    <Flex w="100vw" justifyContent="center" p={4}>
      {nfts.map((nft, i) => (
        <Flex key={i} w="100%" justifyContent="space-evenly">
          <NFTCard
            image={nft.image}
            name={nft.name}
            price={nft.price}
            tokenId={nft.tokenId}
            contractName={nft.contractName}
          />
          <VStack>
            <h1>
              {nft.name}#{nft.tokenId}
            </h1>
            <p>Owned by {nft.owner}</p>
            <p>{nft.description}</p>
            <Flex mt="24px" w="100%" justifyContent="space-around">
              <Flex direction="column" alignItems="flex-start">
                <Text>Owner</Text>
                <Flex alignItems="center">
                  <Avatar size="lg" mt={2} mr={2} />
                  <Text>{formatAddress(nft.owner)}</Text>
                </Flex>
              </Flex>
              <Flex direction="column" alignItems="flex-start">
                <Text>Collection</Text>
                <Flex alignItems="center">
                  <Avatar size="lg" mt={2} mr={2} />
                  <Text>{nft.contractName}</Text>
                </Flex>
              </Flex>
            </Flex>
          </VStack>
        </Flex>
      ))}
    </Flex>
  );
}

export const getServerSideProps = async ({ params }) => {
  const { id } = params;

  return {
    props: {
      id,
    },
  };
};
