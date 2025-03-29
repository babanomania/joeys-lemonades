'use client'

import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Select,
  useToast,
  Alert,
  AlertIcon,
  SimpleGrid,
  Card,
  CardBody,
  Icon,
} from '@chakra-ui/react'
import { Header } from '@/components/Header'
import { useState } from 'react'
import { EmailIcon, PhoneIcon, ChatIcon } from '@chakra-ui/icons'

// FAQ data
const faqs = [
  {
    question: 'How do I place an order?',
    answer: 'Browse our menu, customize your lemonade (size, sweetness, ice), add to cart, and proceed to checkout. You\'ll need a Solana wallet for payment.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept Solana (SOL) payments through connected wallets like Phantom. Make sure your wallet is connected and has sufficient funds.',
  },
  {
    question: 'How does the rewards program work?',
    answer: 'Make purchases to earn NFT rewards! Bronze tier (5 purchases), Silver tier (10 purchases), and Gold tier (20 purchases). Each tier comes with special discounts and perks.',
  },
  {
    question: 'Can I customize my drink?',
    answer: 'Yes! You can customize the size, sweetness level, and amount of ice for each lemonade.',
  },
  {
    question: 'How do I view my NFT rewards?',
    answer: 'Visit the Rewards page while your wallet is connected to view your earned NFTs and available rewards.',
  },
]

// Support ticket categories
const ticketCategories = [
  'Order Issues',
  'Payment Problems',
  'Rewards & NFTs',
  'Account Access',
  'Other',
]

interface SupportTicket {
  name: string
  email: string
  category: string
  subject: string
  message: string
}

export default function Support() {
  const [ticket, setTicket] = useState<SupportTicket>({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/supportTicket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket),
      })

      if (!response.ok) {
        throw new Error('Failed to submit ticket')
      }

      toast({
        title: 'Ticket Submitted',
        description: 'We\'ll get back to you as soon as possible!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      // Reset form
      setTicket({
        name: '',
        email: '',
        category: '',
        subject: '',
        message: '',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit support ticket. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading
            textAlign="center"
            bgGradient="linear(to-r, orange.500, lemon.500)"
            bgClip="text"
            mb={4}
          >
            Customer Support
          </Heading>

          {/* Contact Methods */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Card>
              <CardBody>
                <VStack>
                  <Icon as={EmailIcon} w={8} h={8} color="orange.500" />
                  <Text fontWeight="bold">Email Support</Text>
                  <Text>support@joeyslemonades.com</Text>
                  <Text color="gray.500">24/7 Response</Text>
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <VStack>
                  <Icon as={PhoneIcon} w={8} h={8} color="orange.500" />
                  <Text fontWeight="bold">Phone Support</Text>
                  <Text>1-800-LEMONADE</Text>
                  <Text color="gray.500">Mon-Fri 9am-5pm EST</Text>
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <VStack>
                  <Icon as={ChatIcon} w={8} h={8} color="orange.500" />
                  <Text fontWeight="bold">Live Chat</Text>
                  <Text>Coming Soon!</Text>
                  <Text color="gray.500">AI-powered support</Text>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* FAQ Section */}
          <Box bg="white" p={6} borderRadius="lg" shadow="sm">
            <Heading size="lg" mb={4}>Frequently Asked Questions</Heading>
            <Accordion allowMultiple>
              {faqs.map((faq, index) => (
                <AccordionItem key={index}>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left" fontWeight="semibold">
                        {faq.question}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    {faq.answer}
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Box>

          {/* Support Ticket Form */}
          <Box bg="white" p={6} borderRadius="lg" shadow="sm">
            <Heading size="lg" mb={4}>Submit a Support Ticket</Heading>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>Name</FormLabel>
                    <Input
                      value={ticket.name}
                      onChange={(e) => setTicket({ ...ticket, name: e.target.value })}
                      placeholder="Your name"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      value={ticket.email}
                      onChange={(e) => setTicket({ ...ticket, email: e.target.value })}
                      placeholder="your.email@example.com"
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl isRequired>
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={ticket.category}
                    onChange={(e) => setTicket({ ...ticket, category: e.target.value })}
                    placeholder="Select category"
                  >
                    {ticketCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Subject</FormLabel>
                  <Input
                    value={ticket.subject}
                    onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Message</FormLabel>
                  <Textarea
                    value={ticket.message}
                    onChange={(e) => setTicket({ ...ticket, message: e.target.value })}
                    placeholder="Please provide details about your issue"
                    rows={5}
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="orange"
                  size="lg"
                  width="full"
                  isLoading={submitting}
                >
                  Submit Ticket
                </Button>
              </VStack>
            </form>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}
