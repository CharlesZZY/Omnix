import type { AssistantMessage, UserMessage } from '~/types/chat'
import { ChatOpenAI } from '@langchain/openai'
import { addMessage, createConversation } from '~/server/service/conversation'
import { internalServerError, unauthorized } from '~/utils/service'

const runtimeConfig = useRuntimeConfig()

interface EventStreamMessage {
  id?: string
  event?: 'message' | 'end'
  retry?: number
  data: string
}

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (!user) {
    return unauthorized(event)
  }

  const { model, messages, conversationId: inputConversationId } = await readBody(event)

  let conversationId = inputConversationId

  if (!conversationId) {
    try {
      conversationId = await createConversation(user.id)
    }
    catch (error) {
      return internalServerError(event, String(error), '服务器异常，请稍后重试')
    }
  }

  const lastUserMessage = messages.slice().reverse().find((message: UserMessage) => message.role === 'user')

  const llm = new ChatOpenAI({
    model: 'gpt-4o-mini',
    configuration: {
      apiKey: runtimeConfig.api_key,
      baseURL: runtimeConfig.bese_url,
    },
  })

  const eventStream = createEventStream(event)
  eventStream.send()
  eventStream.onClosed(async () => {
    await eventStream.close()
  })

  const stream = await llm.stream(messages)

  const aiMessage: AssistantMessage = {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: '',
  }

  for await (const chunk of stream) {
    aiMessage.content += JSON.parse(JSON.stringify(chunk.content))
    const eventStreamMessage: EventStreamMessage = {
      id: aiMessage.id,
      event: 'message',
      data: JSON.stringify(chunk.content),
    }
    await eventStream.push(eventStreamMessage)
  }

  await eventStream.push({
    id: aiMessage.id,
    event: 'end',
    data: '',
  })
  await eventStream.close()

  try {
    await addMessage(conversationId, lastUserMessage, aiMessage, model)
  }
  catch (error) {
    return internalServerError(event, String(error), '服务器异常，请稍后重试')
  }
})
