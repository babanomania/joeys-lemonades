import { useEffect, useState } from 'react'
import {
  Box,
  VStack,
  Heading,
  Text,
  Badge,
  Button,
  Spinner,
  useColorModeValue,
  Flex,
  Textarea,
  Select,
  useToast,
  Divider
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useWallet } from '@solana/wallet-adapter-react'
import { useSupportTickets } from '@/hooks/useSupportTickets'
import { TicketStatus } from '@/types/supportTicket'

export const TicketDetail = ({ ticketId }: { ticketId: string }) => {
  const router = useRouter()
  const toast = useToast()
  const { publicKey } = useWallet()
  const {
    currentTicket,
    comments,
    loading,
    fetchTicket,
    updateStatus,
    submitComment
  } = useSupportTickets()

  const [newComment, setNewComment] = useState('')
  const [newStatus, setNewStatus] = useState<TicketStatus>('open')
  const [adminResponse, setAdminResponse] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    if (ticketId) {
      fetchTicket(ticketId)
    }
  }, [ticketId, fetchTicket])

  useEffect(() => {
    if (currentTicket) {
      setNewStatus(currentTicket.status)
      setAdminResponse(currentTicket.adminResponse || '')
    }
  }, [currentTicket])

  const handleStatusUpdate = async () => {
    if (!currentTicket) return

    try {
      setSubmitting(true)
      await updateStatus(currentTicket.id, {
        status: newStatus,
        adminResponse
      })
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCommentSubmit = async () => {
    if (!currentTicket || !newComment.trim()) return

    try {
      setSubmitting(true)
      await submitComment(currentTicket.id, newComment)
      setNewComment('')
    } catch (error) {
      console.error('Failed to submit comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner />
      </Flex>
    )
  }

  if (!currentTicket) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500">Ticket not found</Text>
      </Box>
    )
  }

  const isAdmin = currentTicket.walletAddress !== publicKey?.toString()

  return (
    <VStack spacing={6} align="stretch">
      <Flex justify="space-between" align="center">
        <Button
          variant="ghost"
          onClick={() => router.push('/support')}
          leftIcon={<Text>←</Text>}
        >
          Back to Tickets
        </Button>
        {isAdmin && (
          <Flex gap={4}>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as TicketStatus)}
              w="150px"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </Select>
            <Button
              colorScheme="blue"
              isLoading={submitting}
              onClick={handleStatusUpdate}
            >
              Update Status
            </Button>
          </Flex>
        )}
      </Flex>

      <Box
        p={6}
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
      >
        <VStack align="stretch" spacing={4}>
          <Heading size="lg">{currentTicket.subject}</Heading>
          <Flex gap={2}>
            <Badge colorScheme="blue">
              {currentTicket.orderId ? `Order: ${currentTicket.orderId}` : 'General Inquiry'}
            </Badge>
            <Badge
              colorScheme={
                currentTicket.status === 'open' ? 'red' :
                currentTicket.status === 'in_progress' ? 'yellow' :
                currentTicket.status === 'resolved' ? 'green' : 'gray'
              }
            >
              {currentTicket.status}
            </Badge>
            <Badge colorScheme="purple">{currentTicket.priority}</Badge>
          </Flex>
          <Text>{currentTicket.description}</Text>
          <Text fontSize="sm" color="gray.500">
            Created: {formatDate(currentTicket.createdAt)}
          </Text>
        </VStack>
      </Box>

      {isAdmin && (
        <Box
          p={6}
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
        >
          <VStack align="stretch" spacing={4}>
            <Heading size="sm">Admin Response</Heading>
            <Textarea
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              placeholder="Add an admin response..."
              rows={4}
            />
            <Button
              colorScheme="blue"
              isLoading={submitting}
              onClick={handleStatusUpdate}
            >
              Update Response
            </Button>
          </VStack>
        </Box>
      )}

      <Divider />

      <VStack align="stretch" spacing={4}>
        <Heading size="md">Comments</Heading>
        {comments.map((comment) => (
          <Box
            key={comment.id}
            p={4}
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
          >
            <VStack align="stretch" spacing={2}>
              <Flex justify="space-between" align="center">
                <Text fontSize="sm" fontWeight="bold">
                  {comment.isAdmin ? 'Admin' : 'User'}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {formatDate(comment.createdAt)}
                </Text>
              </Flex>
              <Text>{comment.comment}</Text>
            </VStack>
          </Box>
        ))}

        <Box
          p={4}
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
        >
          <VStack align="stretch" spacing={4}>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
            />
            <Button
              colorScheme="blue"
              isLoading={submitting}
              onClick={handleCommentSubmit}
              isDisabled={!newComment.trim()}
            >
              Add Comment
            </Button>
          </VStack>
        </Box>
      </VStack>
    </VStack>
  )
}
