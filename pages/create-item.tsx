import {
  Box,
  Image as ImageChakra,
  Flex,
  Stack,
  VStack,
  Heading,
  Text,
  Textarea,
  Container,
  Input,
  Button,
  SimpleGrid,
  Avatar,
  AvatarGroup,
  useBreakpointValue,
  IconProps,
  Icon,
} from '@chakra-ui/react';
import { useState, ChangeEvent } from 'react';
import { ethers } from 'ethers';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { useRouter } from 'next/router';
import Web3Modal from 'web3modal';

import { nftaddress, nftmarketaddress } from '../config';

import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json';

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [formInput, updateFormInput] = useState({
    price: '',
    name: '',
    description: '',
  });

  const router = useRouter();

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files[0];

    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      console.log('Error uploading file: ', error);
    }
  }

  async function createItem() {
    const { name, description, price } = formInput;

    if (!name || !description || !price || !fileUrl) return;

    // Upload to IPFS first
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });

    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      // Then pass the URL to save it on Polygon
      createSale(url);
    } catch (e) {
      console.log('Error uploading file: ', e);
    }
  }

  async function createSale(url: string) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    // create item
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
    let transaction = await contract.createToken(url);
    let tx = await transaction.wait();

    let event = tx.events[0];
    let value = event.args[2];
    let tokenId = value.toNumber();

    const price = ethers.utils.parseUnits(formInput.price, 'ether');

    // Then list item for sale on marketplace
    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();

    transaction = await contract.createMarketItem(nftaddress, tokenId, price, {
      value: listingPrice,
    });
    await transaction.wait();

    // after listing, return to homepage
    router.push('/');
  }

  return (
    <Flex h="60vh" p="0 auto" justifyContent="space-evenly" alignItems="center">
      <VStack spacing="24px">
        <Input
          placeholder="Asset Name"
          mt={8}
          p={4}
          onChange={(e) =>
            updateFormInput({ ...formInput, name: e.target.value })
          }
        />
        <Textarea
          placeholder="Asset Description"
          mt={8}
          p={4}
          onChange={(e) =>
            updateFormInput({ ...formInput, description: e.target.value })
          }
        />
        <Input
          placeholder="Asset Price in Matic"
          mt={8}
          p={4}
          onChange={(e) =>
            updateFormInput({ ...formInput, price: e.target.value })
          }
        />
        <Input type="file" name="Asset" my={4} onChange={onChange} />
        <Button
          onClick={createItem}
          fontWeight="bold"
          w="100%"
          mt={4}
          p={4}
          bg="purple.500"
          color="white"
          rounded="md"
          shadow="lg"
          className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
        >
          Create Digital Asset
        </Button>
      </VStack>
      {fileUrl && (
        <ImageChakra
          src={fileUrl}
          alt="uploaded preview"
          width="350"
          height="350"
          mt={4}
        />
      )}
    </Flex>
  );
}
