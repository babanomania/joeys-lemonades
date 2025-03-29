'use client';

import {
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Select,
  useColorModeValue,
} from '@chakra-ui/react';
import { IconType } from 'react-icons';

interface CustomizationOptionProps {
  label: string;
  icon: IconType;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function CustomizationOption({
  label,
  icon,
  options,
  value,
  onChange,
}: CustomizationOptionProps) {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const iconColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <FormControl>
      <HStack spacing={2} mb={2}>
        <Icon as={icon} color={iconColor} />
        <FormLabel margin={0} fontSize="sm" fontWeight="medium">
          {label}
        </FormLabel>
      </HStack>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size="md"
        borderColor={borderColor}
        focusBorderColor="green.500"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </FormControl>
  );
}
