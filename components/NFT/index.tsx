import { Flex, Box, Image, Text } from '@chakra-ui/react';
import SVG from 'react-inlinesvg';
import PolygonIcon from './polygon-matic-logo.svg';

interface NFTProps {
  image: string;
  name: string;
  price: string;
  tokenId?: number;
  contractName?: string;
}

export const NFT = ({
  image,
  name,
  price,
  tokenId = 0,
  contractName = '',
}: NFTProps) => {
  return (
    <Flex m={1} alignItems="center" justifyContent="center">
      <Box
        bg="gray.800"
        maxW="sm"
        borderWidth="1px"
        borderRadius="5px"
        borderColor="rgb(21, 27, 34)"
        rounded="lg"
        shadow="lg"
        position="relative"
        top="0"
        transition="0.2s"
        _hover={{
          top: '-5px',
        }}
      >
        <Image
          boxSize="400px"
          src={image}
          alt={`Picture of ${name}`}
          roundedTop="lg"
          objectFit="cover"
        />

        <Flex p="6" justifyContent="space-between">
          <Flex direction="column">
            <Text fontSize="13px" color="gray.300">
              {contractName}
            </Text>
            <Flex alignContent="center" alignItems="center">
              <Box
                fontSize="l"
                fontWeight="semibold"
                as="h4"
                lineHeight="tight"
                isTruncated
              >
                {`${name}#${tokenId}`}
              </Box>
            </Flex>
          </Flex>
          <Flex direction="column" alignItems="flex-end">
            <Text fontSize="13px" color="gray.300">
              Price
            </Text>
            <Flex alignItems="center">
              <SVG src={PolygonIcon.src} width={24} height={24} title="Icon" />
              <Box ml={2} fontSize="l" color="white">
                {price}
              </Box>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </Flex>
  );
};
