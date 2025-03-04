import { StringOutputParser } from '@langchain/core/output_parsers'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'

const runtimeConfig = useRuntimeConfig()

export default defineEventHandler(async (_event) => {
  const model = new ChatOpenAI({
    model: 'gpt-4o-mini',
    configuration: {
      apiKey: runtimeConfig.api_key,
      baseURL: runtimeConfig.bese_url,
    },
  })
  const prompt = ChatPromptTemplate.fromTemplate(
    ``,
  )

  const outputParser = new StringOutputParser()

  const chain = prompt.pipe(model).pipe(outputParser)

  const stream = await chain.stream({
    question: 'hello',
  })

  return stream
})
