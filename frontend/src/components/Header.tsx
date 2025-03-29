'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Flex,
  Heading,
  Button,
  HStack,
  IconButton,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  VStack,
  Text,
  Icon,
  Container,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { WalletConnect } from './WalletConnect'
import { usePathname } from 'next/navigation'
import { FaLemon, FaGift, FaShoppingCart, FaUserCircle, FaHamburger } from 'react-icons/fa'
import { useCart } from '@/app/contexts/CartContext'
import { AdminService } from '@/services/adminService'
import { useWallet } from '@solana/wallet-adapter-react'

const NavLink = ({ href, children, isActive }: { href: string; children: React.ReactNode; isActive: boolean }) => (
  <NextLink href={href} passHref legacyBehavior>
    <Button
      as="a"
      variant="ghost"
      colorScheme="orange"
      position="relative"
      px={4}
      _after={{
        content: '""',
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        height: '2px',
        bg: 'orange.500',
        opacity: isActive ? 1 : 0,
        transition: 'opacity 0.2s',
      }}
    >
      {children}
    </Button>
  </NextLink>
)

export function Header() {
  const pathname = usePathname()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { items } = useCart()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const { publicKey } = useWallet()

  const navItems = [
    { href: '/menu', label: 'Menu', icon: FaLemon },
    { href: '/rewards', label: 'Rewards', icon: FaGift },
  ]

  const adminService = new AdminService()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      if (!publicKey) {
        setIsAdmin(false)
        return
      }

      try {
        const isAdminUser = await adminService.isAdmin(publicKey.toString())
        setIsAdmin(isAdminUser)
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
      }
    }

    checkAdmin()
  }, [publicKey])

  const allNavItems = isAdmin
    ? [...navItems, { href: '/admin', label: 'Admin', icon: FaUserCircle }]
    : navItems

  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      zIndex={100}
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
    >
      <Container maxW="container.xl">
        <Flex py={4} align="center" justify="space-between">
          <NextLink href="/" passHref>
            <Flex align="center" cursor="pointer">
              <Icon as={FaLemon} boxSize={8} color="orange.500" mr={2} />
              <Heading size="lg" color="orange.500">
                Joey's Lemonades
              </Heading>
            </Flex>
          </NextLink>

          {/* Desktop Navigation */}
          <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
            {allNavItems.map((item) => (
              <NavLink key={item.href} href={item.href} isActive={pathname === item.href}>
                <Icon as={item.icon} mr={2} />
                {item.label}
              </NavLink>
            ))}
          </HStack>

          {/* Actions */}
          <HStack spacing={2}>
            <WalletConnect />
            <NextLink href="/cart" passHref>
              <IconButton
                aria-label="Shopping Cart"
                icon={
                  <Flex position="relative">
                    <FaShoppingCart />
                    {items.length > 0 && (
                      <Box
                        position="absolute"
                        top="-8px"
                        right="-8px"
                        bg="orange.500"
                        color="white"
                        borderRadius="full"
                        w="16px"
                        h="16px"
                        fontSize="xs"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        {items.length}
                      </Box>
                    )}
                  </Flex>
                }
                variant="ghost"
                colorScheme="orange"
              />
            </NextLink>

            {/* Mobile Menu Button */}
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              aria-label="Open menu"
              icon={<FaHamburger />}
              onClick={onOpen}
              variant="ghost"
              colorScheme="orange"
            />
          </HStack>
        </Flex>
      </Container>

      {/* Mobile Navigation */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody>
            <VStack spacing={4} align="stretch" mt={8}>
              {allNavItems.map((item) => (
                <Button
                  key={item.href}
                  as={NextLink}
                  href={item.href}
                  variant="ghost"
                  colorScheme="orange"
                  justifyContent="flex-start"
                  leftIcon={<Icon as={item.icon} />}
                  onClick={onClose}
                >
                  {item.label}
                </Button>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}
