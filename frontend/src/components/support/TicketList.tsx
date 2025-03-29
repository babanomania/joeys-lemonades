import { useEffect } from 'react'
import {
  Box,
  VStack,
  Heading,
  Text,
  Badge,
  Button,
  Spinner,
  useColorModeValue,
  Flex
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useSupportTickets } from '@/hooks/useSupportTickets'
import { SupportTicket } from '@/types/supportTicket'

const TicketStatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'red'
      case 'in_progress':
        return 'yellow'
      case 'resolved':
        return 'green'
      case 'closed':
        return 'gray'
      default:
        return 'gray'
    }
  }

  return (
    <Badge colorScheme={getStatusColor(status)} fontSize="sm">
      {status.replace('_', ' ')}
    </Badge>
  )
}

const TicketPriorityBadge = ({ priority }: { priority: string }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'red'
      case 'high':
        return 'orange'
      case 'medium':
        return 'yellow'
      case 'low':
        return 'green'
      default:
        return 'gray'
    }
  }

  return (
    <Badge colorScheme={getPriorityColor(priority)} variant="subtle" ml={2}>
      {priority}
    </Badge>
  )
}

const TicketCard = ({ ticket }: { ticket: SupportTicket }) => {
  const router = useRouter()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Box
      p={4}
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      _hover={{ shadow: 'md' }}
      cursor="pointer"
      onClick={() => router.push(`/support/${ticket.id}`)}
    >
      <Flex justifyContent="space-between" alignItems="flex-start">
        <VStack align="start" spacing={2} flex={1}>
          <Heading size="sm">{ticket.subject}</Heading>
          <Text fontSize="sm" color="gray.500">
            {ticket.description.length > 100
              ? `${ticket.description.substring(0, 100)}...`
              : ticket.description}
          </Text>
          <Text fontSize="xs" color="gray.500">
            Created: {formatDate(ticket.createdAt)}
          </Text>
        </VStack>
        <VStack align="end" spacing={2}>
          <TicketStatusBadge status={ticket.status} />
          <TicketPriorityBadge priority={ticket.priority} />
        </VStack>
      </Flex>
    </Box>
  )
}

export const TicketList = () => {
  const { tickets, loading, fetchTickets } = useSupportTickets()
  const router = useRouter()

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner />
      </Flex>
    )
  }

  return (
    <VStack spacing={4} align="stretch" w="full">
      <Flex justify="space-between" align="center">
        <Heading size="md">Support Tickets</Heading>
        <Button
          colorScheme="blue"
          onClick={() => router.push('/support/new')}
        >
          New Ticket
        </Button>
      </Flex>

      {tickets.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Text color="gray.500">No support tickets found</Text>
        </Box>
      ) : (
        tickets.map(ticket => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))
      )}
    </VStack>
  )
}
