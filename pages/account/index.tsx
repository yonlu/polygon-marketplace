import { Avatar, Box, Flex, LinkBox, Text } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import Web3 from 'web3';
import Web3Modal from 'web3modal';

const Account = () => {
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [userBalance, setUserBalance] = useState(null);

  useEffect(() => {
    connectWalletHandler();
  }, [defaultAccount]);

  const connectWalletHandler = async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const address = await signer.getAddress();
    setDefaultAccount(address);
  };

  return (
    <Box w="100vw" p={4}>
      <Flex direction="column" align="center" minH="200px" margin="0px auto">
        <Avatar size="2xl" />
        <Text>Account: {defaultAccount}</Text>
      </Flex>
    </Box>
  );
};

export default Account;
