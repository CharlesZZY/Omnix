import { ChatOpenAI } from '@langchain/openai'

const runtimeConfig = useRuntimeConfig()

export default defineEventHandler(async (_event) => {
  const model = new ChatOpenAI({ model: 'gpt-4o-mini', configuration: {
    apiKey: runtimeConfig.api_key,
    baseURL: runtimeConfig.bese_url,
  } })
  const aiMsg = await model.invoke([
    {
      role: 'system',
      content:
      'Hello',
    },
    {
      role: 'user',
      content: 'output success',
    },
  ])

  return aiMsg
})
