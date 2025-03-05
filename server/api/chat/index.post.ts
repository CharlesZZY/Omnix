import type { AssistantMessage, UserMessage } from '~/types/chat'
import { ChatOpenAI } from '@langchain/openai'
import { HttpResponseOutputParser } from 'langchain/output_parsers'
import { addMessage, createConversation } from '~/server/service/conversation'
import { internalServerError, unauthorized } from '~/utils/service'

const runtimeConfig = useRuntimeConfig()

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (!user) {
    return unauthorized(event)
  }

  const { model, messages } = await readBody(event)
  let { conversationId } = await readBody(event)

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

  const chain = llm.pipe(new HttpResponseOutputParser({ contentType: 'text/event-stream' }))

  const stream = await chain.stream(messages)

  const aiMessage: AssistantMessage = {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: '',
  }

  // for await (const chunk of stream) {
  //   console.log(chunk)
  //   aiMessage.content += chunk
  // }

  try {
    await addMessage(conversationId, lastUserMessage, aiMessage, model)
  }
  catch (error) {
    return internalServerError(event, String(error), '服务器异常，请稍后重试')
  }

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
    },
  })
})
