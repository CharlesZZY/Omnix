import type { AssistantMessage, ConversationDetailMetadata, EventStreamMessage, TitleGenerationMetadata, UserMessage } from '~/types/chat'
import { ChatOpenAI, OpenAI } from '@langchain/openai'
import { z } from 'zod'
import { addMessage, createConversation, updateConversationTitle } from '~/server/service/conversation'
import { badRequest, errorResponse, internalServerError, unauthorized } from '~/utils/service'

const runtimeConfig = useRuntimeConfig()

const UserMessageSchema = z.object({
  id: z.string().length(36),
  role: z.literal('user'),
  content: z.string(),
})

const AssistantMessageSchema = z.object({
  id: z.string().length(36),
  role: z.literal('assistant'),
  content: z.string(),
})

const MessageSchema = z.union([UserMessageSchema, AssistantMessageSchema])

const RequestSchema = z.object({
  baseURL: z.string(),
  apiKey: z.string(),
  model: z.string(),
  temperature: z.number(),
  maxTokens: z.number().min(1).max(8192),
  systemPrompt: z.string(),
  topP: z.number().min(0).max(2),
  frequencyPenalty: z.number().min(0).max(2),
  presencePenalty: z.number().min(0).max(2),
  messages: z.array(MessageSchema),
  conversationId: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (!user) {
    return unauthorized(event)
  }

  const { success, data, error } = await readValidatedBody(event, RequestSchema.safeParse)
  if (!success) {
    return errorResponse(event, 400, error.issues.map(e => e.message).join(', '))
  }

  const { baseURL, apiKey, model, temperature, maxTokens, topP, frequencyPenalty, presencePenalty, messages, conversationId: inputConversationId } = data

  let conversationId = inputConversationId || ''

  if (!conversationId) {
    try {
      conversationId = await createConversation(user.id)
    }
    catch (error) {
      return internalServerError(event, String(error), '服务器异常，请稍后重试')
    }
  }

  const lastUserMessage = messages.slice().reverse().find(m => m.role === 'user') as UserMessage | undefined

  if (!lastUserMessage) {
    return badRequest(event, '请求参数有误')
  }

  const llm = new ChatOpenAI({
    model,
    temperature,
    maxTokens,
    topP,
    frequencyPenalty,
    presencePenalty,
    configuration: {
      apiKey,
      baseURL,
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

  // 判断是否是用户与AI的第一次交互
  const isFirstInteraction = messages.filter(m => m.role === 'user').length === 1

  if (isFirstInteraction && lastUserMessage) {
    // 生成 title
    const title = await generateTitle(lastUserMessage, aiMessage, llm)
    await updateConversationTitle(conversationId, String(title))

    const titleGenerationMetadata: TitleGenerationMetadata = {
      title: String(title),
    }
    const eventStreamMessage: EventStreamMessage = {
      event: 'title_generation',
      data: JSON.stringify(titleGenerationMetadata),
    }
    await eventStream.push(eventStreamMessage)
  }

  const conversationDetailMetadata: ConversationDetailMetadata = {
    conversationId,
  }
  const eventStreamMessage: EventStreamMessage = {
    event: 'conversation_detail_metadata',
    data: JSON.stringify(conversationDetailMetadata),
  }
  await eventStream.push(eventStreamMessage)

  const endMessage: EventStreamMessage = {
    event: 'end',
    data: '',
  }
  await eventStream.push(endMessage)

  try {
    await addMessage(conversationId, lastUserMessage, aiMessage, model)
  }
  catch (error) {
    return internalServerError(event, String(error), '服务器异常，请稍后重试')
  }

  await eventStream.close()
})

/**
 * 生成对话的标题
 */
async function generateTitle(userMessage: UserMessage, aiMessage: AssistantMessage, llm: ChatOpenAI) {
  const { content } = await llm.invoke([
    {
      role: 'system',
      content: '你是一名专业的对话标题生成器。请根据以下对话内容，生成一个5-15字的富有创意且清晰精炼的标题，便于后续识别与管理。注意语言类型',
    },
    {
      role: 'user',
      content: `用户：${userMessage.content}\n\nAI：${aiMessage.content}`,
    },
  ])

  return content || '新对话'
}
