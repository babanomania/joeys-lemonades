'use client';

import {
  Box,
  Card as ChakraCard,
  CardProps as ChakraCardProps,
  useColorModeValue,
} from '@chakra-ui/react';

interface SharedCardProps extends ChakraCardProps {
  children: React.ReactNode;
}

export function SharedCard({ children, ...props }: SharedCardProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <ChakraCard
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      overflow="hidden"
      width="100%"
      {...props}
    >
      {children}
    </ChakraCard>
  );
}
