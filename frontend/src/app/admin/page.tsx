'use client';

import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Switch,
  useToast,
  Heading,
  VStack,
  Spinner,
  Center,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { AdminService } from '@/services/adminService';
import { MenuService, MenuItem } from '@/services/menuService';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { useWallet } from '@solana/wallet-adapter-react';
import { SharedCard } from '@/components/SharedCard';
import { NFTService } from '@/services/nftService';
import type { NFTStats } from '@/services/nftService';

interface OrderItem {
  name: string;
  size: 'small' | 'large';
  quantity: number;
  price: number;
  customizations?: {
    sweetness?: number;
    ice?: number;
  };
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  wallet_address: string;
  transaction_signature: string;
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [nftStats, setNftStats] = useState<NFTStats>({ bronze: 0, silver: 0, gold: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const wallet = useWallet();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        if (!wallet.publicKey) {
          toast({
            title: 'Wallet not connected',
            description: 'Please connect your wallet to access admin panel',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          router.push('/');
          return;
        }

        const isAdmin = await AdminService.checkAdminAccess(wallet.publicKey.toString());
        setIsAdmin(isAdmin);
        
        if (!isAdmin) {
          toast({
            title: 'Access Denied',
            description: 'You do not have admin access.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          router.push('/');
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        toast({
          title: 'Error',
          description: 'Failed to verify admin access.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        router.push('/');
      }
    };

    checkAdmin();
  }, [router, wallet.publicKey, toast]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAdmin) return;

      try {
        const adminService = new AdminService();
        const [ordersData, menuData] = await Promise.all([
          adminService.getOrders(),
          MenuService.getMenuItems(),
        ]);

        setOrders(ordersData);
        setMenuItems(menuData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load admin data.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin, toast]);

  useEffect(() => {
    const fetchNFTData = async () => {
      if (!isAdmin || !wallet.publicKey) return;

      try {
        const nftService = new NFTService(wallet);
        const stats = await nftService.fetchNFTStats();
        setNftStats(stats);
      } catch (error) {
        console.error('Error fetching NFT data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load NFT data',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchNFTData();
  }, [isAdmin, wallet, toast]);

  const handleToggleAvailability = async (itemId: string, currentAvailable: boolean) => {
    try {
      await MenuService.updateItemAvailability(itemId, !currentAvailable);
      setMenuItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, is_available: !currentAvailable } : item
        )
      );
      
      toast({
        title: 'Success',
        description: `Item ${!currentAvailable ? 'enabled' : 'disabled'} successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to update item availability',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const tabs = [
    { id: 'orders', label: 'Orders' },
    { id: 'menu', label: 'Menu' },
  ];

  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');

  if (loading) {
    return (
      <Box minH="100vh">
        <Header />
        <Center h="calc(100vh - 64px)">
          <Spinner size="xl" color="orange.500" />
        </Center>
      </Box>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Header />
      <Container maxW="container.xl" py={8}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          <SharedCard p={6}>
            <Stat>
              <StatLabel>Total Orders</StatLabel>
              <StatNumber>{orders.length}</StatNumber>
            </Stat>
          </SharedCard>
          <SharedCard p={6}>
            <Stat>
              <StatLabel>Total Revenue</StatLabel>
              <StatNumber>${orders.reduce((acc, order) => acc + order.total, 0).toFixed(2)}</StatNumber>
            </Stat>
          </SharedCard>
          <SharedCard p={6}>
            <Stat>
              <StatLabel>Active NFTs</StatLabel>
              <StatNumber>{nftStats.total}</StatNumber>
            </Stat>
          </SharedCard>
        </SimpleGrid>

        <SharedCard width="100%">
          <Tabs>
            <TabList>
              {tabs.map(tab => (
                <Tab key={tab.id} onClick={() => setActiveTab(tab.id as 'orders' | 'menu')}>{tab.label}</Tab>
              ))}
            </TabList>

            <TabPanels>
              {tabs.map(tab => (
                <TabPanel key={tab.id}>
                  {tab.id === 'orders' ? (
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th py={6}>Order ID</Th>
                          <Th py={6}>Customer</Th>
                          <Th py={6}>Items</Th>
                          <Th py={6}>Total</Th>
                          <Th py={6}>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {orders.map((order) => (
                          <Tr key={order.id}>
                            <Td py={4}>{order.id}</Td>
                            <Td py={4}>{order.wallet_address.slice(0, 8)}...</Td>
                            <Td py={4}>{order.items.length} items</Td>
                            <Td py={4}>${order.total.toFixed(2)}</Td>
                            <Td py={4}>
                              <Badge
                                colorScheme={
                                  order.status === 'completed'
                                    ? 'green'
                                    : order.status === 'pending'
                                    ? 'yellow'
                                    : 'red'
                                }
                              >
                                {order.status}
                              </Badge>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  ) : (
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th py={6}>Name</Th>
                          <Th py={6}>Price</Th>
                          <Th py={6}>Category</Th>
                          <Th py={6}>Active</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {menuItems.map((item) => (
                          <Tr key={item.id}>
                            <Td py={4}>{item.name}</Td>
                            <Td py={4}>${item.price.toFixed(2)}</Td>
                            <Td py={4}>{item.category}</Td>
                            <Td py={4}>
                              <Switch
                                isChecked={item.is_available}
                                onChange={() => handleToggleAvailability(item.id, item.is_available)}
                              />
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  )}
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </SharedCard>
      </Container>
    </Box>
  )
}
