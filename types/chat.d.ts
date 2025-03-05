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
