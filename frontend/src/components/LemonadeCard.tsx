'use client';

import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Heading,
  Stack,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import Image from 'next/image';
import { useState } from 'react';
import { FaTint, FaLeaf, FaIceCream } from 'react-icons/fa';
import { CustomizationOption } from '@/components/CustomizationOption';
import { useCart } from '@/app/contexts/CartContext';

type LemonadeSize = 'Small' | 'Large';
type SweetnessLevel = 'Less Sweet' | 'Normal' | 'Extra Sweet';
type IceLevel = 'No Ice' | 'Light Ice' | 'Regular Ice' | 'Extra Ice';

interface LemonadeCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  tags: string[];
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  customizations: {
    size: LemonadeSize;
    sweetness: SweetnessLevel;
    ice: IceLevel;
  };
}

export function LemonadeCard({ id, name, description, price, image, category, tags }: LemonadeCardProps) {
  const [selectedSize, setSelectedSize] = useState<LemonadeSize>('Small');
  const [selectedSweetness, setSelectedSweetness] = useState<SweetnessLevel>('Normal');
  const [selectedIce, setSelectedIce] = useState<IceLevel>('Regular Ice');
  const { addToCart } = useCart();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  const handleAddToCart = () => {
    const orderItem: OrderItem = {
      id,
      name,
      price,
      customizations: {
        size: selectedSize,
        sweetness: selectedSweetness,
        ice: selectedIce,
      },
    };
    addToCart(orderItem);
  };

  return (
    <Card
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      overflow="hidden"
      boxShadow="sm"
      width="100%"
    >
      <Box position="relative" height="200px">
        <Image
          src={image}
          alt={name}
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </Box>

      <CardBody p={6}>
        <VStack spacing={4} align="stretch">
          <Box>
            <Stack direction="row" spacing={2} mb={2}>
              {tags.map((tag) => (
                <Badge key={tag} colorScheme="green" fontSize="xs">
                  {tag}
                </Badge>
              ))}
            </Stack>
            <Heading size="md" mb={2}>{name}</Heading>
            <Text color={textColor} fontSize="sm" mb={4}>
              {description}
            </Text>
            <Text fontWeight="bold" fontSize="lg" color="green.500" mb={4}>
              ${price.toFixed(2)}
            </Text>
          </Box>

          <Divider />

          <VStack spacing={4} align="stretch">
            <CustomizationOption
              label="Size"
              icon={FaTint}
              options={['Small', 'Large']}
              value={selectedSize}
              onChange={(value: string) => setSelectedSize(value as LemonadeSize)}
            />
            <CustomizationOption
              label="Sweetness"
              icon={FaLeaf}
              options={['Less Sweet', 'Normal', 'Extra Sweet']}
              value={selectedSweetness}
              onChange={(value: string) => setSelectedSweetness(value as SweetnessLevel)}
            />
            <CustomizationOption
              label="Ice Level"
              icon={FaIceCream}
              options={['No Ice', 'Light Ice', 'Regular Ice', 'Extra Ice']}
              value={selectedIce}
              onChange={(value: string) => setSelectedIce(value as IceLevel)}
            />
          </VStack>

          <Button
            colorScheme="green"
            size="lg"
            width="100%"
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );
}
