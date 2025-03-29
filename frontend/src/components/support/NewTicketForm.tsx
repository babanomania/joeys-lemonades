import { useState } from 'react'
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useColorModeValue,
  FormErrorMessage,
  Select,
  useToast
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useSupportTickets } from '@/hooks/useSupportTickets'
import { CreateTicketInput } from '@/types/supportTicket'
import { useOrders } from '@/hooks/useOrders' // Assuming you have this hook

export const NewTicketForm = () => {
  const router = useRouter()
  const toast = useToast()
  const { submitTicket } = useSupportTickets()
  const { orders } = useOrders()

  const [formData, setFormData] = useState<CreateTicketInput>({
    subject: '',
    description: '',
    orderId: undefined
  })

  const [errors, setErrors] = useState({
    subject: '',
    description: ''
  })

  const [submitting, setSubmitting] = useState(false)

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const validateForm = () => {
    const newErrors = {
      subject: '',
      description: ''
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    setErrors(newErrors)
    return !newErrors.subject && !newErrors.description
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
      return
    }

    try {
      setSubmitting(true)
      const ticket = await submitTicket(formData)
      
      if (ticket) {
        toast({
          title: 'Success',
          description: 'Support ticket created successfully',
          status: 'success',
          duration: 5000,
          isClosable: true
        })
        router.push('/support')
      }
    } catch (error) {
      console.error('Failed to create ticket:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      p={6}
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      w="full"
      maxW="800px"
      mx="auto"
    >
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Create Support Ticket</Heading>

        <FormControl isInvalid={!!errors.subject}>
          <FormLabel>Subject</FormLabel>
          <Input
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Brief description of your issue"
          />
          <FormErrorMessage>{errors.subject}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel>Related Order (Optional)</FormLabel>
          <Select
            name="orderId"
            value={formData.orderId || ''}
            onChange={handleChange}
            placeholder="Select an order"
          >
            {orders?.map(order => (
              <option key={order.id} value={order.id}>
                Order #{order.id} - {new Date(order.createdAt).toLocaleDateString()}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl isInvalid={!!errors.description}>
          <FormLabel>Description</FormLabel>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Detailed description of your issue"
            minH="200px"
          />
          <FormErrorMessage>{errors.description}</FormErrorMessage>
        </FormControl>

        <Box pt={4}>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={submitting}
            mr={4}
          >
            Submit Ticket
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push('/support')}
            isDisabled={submitting}
          >
            Cancel
          </Button>
        </Box>
      </VStack>
    </Box>
  )
}
