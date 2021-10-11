import {
  useDisclosure,
  Flex,
  Text,
  Button,
  Link as ChakraLink,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import Link from 'next/link';
import { SearchBox } from './SearchBox';
import { NotificationsNav } from './NotificationsNav';
import { Profile } from './Profile';
import { RiUserLine, RiBookOpenLine, RiSettings2Line } from 'react-icons/ri';

export const Header = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex
      as="header"
      alignItems="center"
      justifyContent="space-evenly"
      w="100%"
      p={4}
      bgColor="gray.800"
    >
      <Link href="/" passHref>
        <Text
          as="a"
          color="purple.500"
          fontSize={['2xl', '3xl']}
          fontWeight="bold"
          transition="0.2s"
          _hover={{
            color: 'purple.700',
          }}
        >
          Marketplace
        </Text>
      </Link>
      <SearchBox />
      <Flex alignItems="center" justifyContent="space-evenly">
        <Link href="/" passHref>
          <ChakraLink mx={2} _hover={{ color: 'purple.500' }}>
            Home
          </ChakraLink>
        </Link>
        <Link href="/create-item" passHref>
          <ChakraLink mx={2} _hover={{ color: 'purple.500' }}>
            Create NFT
          </ChakraLink>
        </Link>
        <Link href="/my-assets" passHref>
          <ChakraLink mx={2} _hover={{ color: 'purple.500' }}>
            My Collection
          </ChakraLink>
        </Link>
        <Link href="/creator-dashboard" passHref>
          <ChakraLink mx={2} _hover={{ color: 'purple.500' }}>
            Creator Dashboard
          </ChakraLink>
        </Link>
      </Flex>
      <NotificationsNav />
      <Menu isOpen={isOpen}>
        <MenuButton onMouseEnter={onOpen}>
          <Profile />
        </MenuButton>
        <MenuList
          onMouseLeave={onClose}
          p={0}
          sx={{
            bg: 'gray.700',
            color: 'gray.200',
          }}
        >
          <Link href="/account" passHref>
            <MenuItem
              h={14}
              icon={<RiUserLine fontSize={20} />}
              _hover={{
                bg: 'gray.800',
              }}
            >
              <Text>Profile</Text>
            </MenuItem>
          </Link>
          <Link href="/my-assets" passHref>
            <MenuItem
              h={14}
              icon={<RiBookOpenLine fontSize={20} />}
              _hover={{
                bg: 'gray.800',
              }}
            >
              <Text>My Collections</Text>
            </MenuItem>
          </Link>
          <MenuItem
            h={14}
            icon={<RiSettings2Line fontSize={20} />}
            _hover={{
              bg: 'gray.800',
            }}
          >
            <Text>Settings</Text>
          </MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
};
