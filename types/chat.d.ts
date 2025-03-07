interface BaseMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export interface UserMessage extends BaseMessage {
  role: 'user'
}

export interface AssistantMessage extends BaseMessage {
  role: 'assistant'
  reason?: string
}

type Status = 'pending' | 'loading' | 'success' | 'error'

export interface Chat {
  userMessage: UserMessage
  aiMessage: AssistantMessage
  status: Status
}

export interface EventStreamMessage {
  id?: string
  event: 'message' | 'conversation_detail_metadata' | 'title_generation' | 'end' | string
  data: string
  retry?: number
}

interface AdvancedSettings {
  label: 'Top P' | 'Frequency Penalty' | 'Presence Penalty'
  min: number
  max: number
  step: number
  value: number
}
export interface ChatSettings {
  // baseUrlPrefix: string
  apiKey: string
  baseUrl: string
  model: string
  temperature: number
  maxTokens: number
  systemPrompt: string
  advanced: AdvancedSettings[]
}

export interface TitleGenerationMetadata {
  title: string
}

export interface ConversationDetailMetadata {
  conversationId: string
}

export interface LLMConfig {
  baseURL: string
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
  systemPrompt: string
  topP: number
  frequencyPenalty: number
  presencePenalty: number
}
