import { ChatOpenAI } from '@langchain/openai'
import { HttpResponseOutputParser } from 'langchain/output_parsers'

const runtimeConfig = useRuntimeConfig()

export default defineEventHandler(async (event) => {
  const { messages } = await readBody(event)

  const model = new ChatOpenAI({
    model: 'gpt-4o-mini',
    configuration: {
      apiKey: runtimeConfig.api_key,
      baseURL: runtimeConfig.bese_url,
    },
  })

  const chain = model.pipe(new HttpResponseOutputParser({ contentType: 'text/event-stream' }))

  const stream = await chain.stream(messages)

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
    },
  })
})
