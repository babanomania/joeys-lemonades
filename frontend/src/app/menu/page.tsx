'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Button,
  HStack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  SimpleGrid,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { MenuItem, MenuService } from '@/services/menuService';
import { LemonadeCard } from '@/components/LemonadeCard';
import { Header } from '@/components/Header';
import { useRouter } from 'next/navigation';
import { useCart } from '../contexts/CartContext';
import { FaTint } from 'react-icons/fa';

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const router = useRouter();
  const { items } = useCart();
  const textColor = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const items = await MenuService.getAvailableMenuItems();
        setMenuItems(items);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const filteredMenuItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Header />
      
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <HStack justify="space-between" wrap="wrap" spacing={4}>
            <VStack align="flex-start" spacing={1}>
              <Heading
                bgGradient="linear(to-r, orange.500, yellow.500)"
                bgClip="text"
              >
                Our Fresh Lemonades
              </Heading>
              <Text color={textColor}>
                Customize your perfect drink with our premium options
              </Text>
            </VStack>
            
            <Button
              colorScheme="orange"
              onClick={() => router.push('/payment')}
              isDisabled={items.length === 0}
              leftIcon={<Icon as={FaTint} />}
            >
              Checkout ({items.length})
            </Button>
          </HStack>

          <Tabs colorScheme="orange" onChange={(index) => {
            setSelectedCategory(['all', 'classic', 'premium', 'seasonal'][index])
          }}>
            <TabList>
              <Tab>All</Tab>
              <Tab>Classic</Tab>
              <Tab>Premium</Tab>
              <Tab>Seasonal</Tab>
            </TabList>

            <TabPanels>
              {['all', 'classic', 'premium', 'seasonal'].map((category) => (
                <TabPanel key={category} px={0}>
                  {loading ? (
                    <Text textAlign="center">Loading menu items...</Text>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                      {filteredMenuItems.map((item) => (
                        <LemonadeCard
                          key={item.id}
                          id={item.id}
                          name={item.name}
                          description={item.description || ''}
                          price={item.price}
                          image={item.image_url || ''}
                          category={item.category}
                          tags={item.tags || []}
                        />
                      ))}
                    </SimpleGrid>
                  )}
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
    </Box>
  );
}
