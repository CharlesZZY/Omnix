<script setup lang="tsx">
import type { BubbleProps, ConversationsProps } from 'ant-design-x-vue'
import type { Api } from '~/types/api'
import type { AssistantMessage, Chat, ChatSettings, EventStreamMessage, UserMessage } from '~/types/chat'
import { vAutoAnimate } from '@formkit/auto-animate'
import { Flex, message } from 'ant-design-vue'
import { Bubble, Sender } from 'ant-design-x-vue'
import { MdPreview } from 'md-editor-v3'
import { v4 as uuidv4 } from 'uuid'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import ChatLayout from './chat.vue'
import 'md-editor-v3/lib/preview.css'

defineOptions({ name: 'ConversationLayout' })

const route = useRoute()
const llmConfig = useLLMConfigStore()

const id = ref(route.params.id)

const container = ref<HTMLElement | null>(null)
const userScrolled = ref(false)

const query = ref<string>('')
const conversationId = ref<string>('')
const conversationTitle = ref<string>('')
const loading = ref<boolean>(false)
const chatList = ref<Chat[]>([])
const conversations = ref<ConversationsProps['items']>([])

const markdownRender: BubbleProps['messageRender'] = content => (
  <MdPreview autoFoldThreshold={10000} modelValue={content} />
)

const displayChatList = computed(() =>
  chatList.value.reduce((acc, { userMessage, aiMessage }, index, array) => {
    const isLast = index === array.length - 1
    acc.push(
      { id: userMessage.id, role: userMessage.role, content: userMessage.content, placement: 'end' },
      { id: aiMessage.id, role: aiMessage.role, content: aiMessage.content, placement: 'start', variant: 'borderless', messageRender: markdownRender, loading: isLast && getLastChat().status === 'pending' },
    )
    return acc
  }, [] as BubbleProps[]),
)

function getLastChat() {
  return chatList.value[chatList.value.length - 1]
}

function ready(query: string) {
  const userMessage: UserMessage = {
    id: uuidv4(),
    role: 'user',
    content: query,
  }
  const aiMessage: AssistantMessage = {
    id: '',
    role: 'assistant',
    content: '',
  }
  chatList.value.push({
    userMessage,
    aiMessage,
    status: 'pending',
  })
  loading.value = true
}

async function sendMessage(inputQuery: string) {
  if (!inputQuery || loading.value) {
    return
  }
  const messages = chatList.value.flatMap(({ userMessage, aiMessage }) => [
    { id: userMessage.id, role: userMessage.role, content: userMessage.content },
    { id: userMessage.id, role: aiMessage.role, content: aiMessage.content },
  ])

  ready(inputQuery)

  query.value = ''

  const lastChat = getLastChat()

  messages.push({ id: lastChat.userMessage.id, role: lastChat.userMessage.role, content: lastChat.userMessage.content })

  scrollToBottom(container.value)

  async function onOpen(_response: Response): Promise<void> {
    lastChat.status = 'loading'
    return await Promise.resolve()
  }

  function onMessage(ev: EventStreamMessage): void {
    try {
      switch (ev.event) {
        case 'message': {
          const data = JSON.parse(ev.data)
          if (lastChat.aiMessage.role === 'assistant') {
            lastChat.aiMessage.content += data
          }
          scrollToBottom(container.value)
          break
        }
        case 'title_generation': {
          const { title } = JSON.parse(ev.data)
          conversationTitle.value = title
          break
        }
        case 'conversation_detail_metadata': {
          const { conversationId: id } = JSON.parse(ev.data)

          if (conversations.value && !conversationId.value) {
            conversations.value.unshift({
              key: id,
              label: conversationTitle.value || '新对话',
            })
          }
          conversationId.value = id

          // window.history.pushState(null, '', `/chat/${id}`)
          navigateTo(`/chat/${id}`)
          break
        }
        case 'end': {
          lastChat.status = 'success'
          break
        }
      }
    }
    catch (error) {
      message.info('服务器错误，请稍后重试')
      console.error(error)
    }
  }

  function onClose(): void {}

  function onError(ev: Event): void {
    console.error(ev)
    throw new Error('An error occurred while connecting to the server')
  }

  await connect('/api/chat', {
    messages,
    conversationId: conversationId.value,
    ...llmConfig.getConfig,
  }, onOpen, onMessage, onClose, onError)

  loading.value = false
  scrollToBottom(container.value)
}

function stop() {
  loading.value = false
}

const settings = ref<ChatSettings>({
  // baseUrlPrefix: 'https://',
  apiKey: llmConfig.apiKey,
  baseUrl: llmConfig.baseURL,
  model: llmConfig.model,
  temperature: llmConfig.temperature,
  maxTokens: llmConfig.maxTokens,
  systemPrompt: llmConfig.systemPrompt,
  advanced: [
    {
      label: 'Top P',
      min: 0,
      max: 2,
      step: 0.1,
      value: llmConfig.topP,
    },
    // {
    //   label: 'Top K',
    //   min: 0,
    //   max: 50,
    //   step: 1,
    //   value: 10,
    // },
    {
      label: 'Frequency Penalty',
      min: 0,
      max: 2,
      step: 0.1,
      value: llmConfig.frequencyPenalty,
    },
    {
      label: 'Presence Penalty',
      min: 0,
      max: 2,
      step: 0.1,
      value: llmConfig.presencePenalty,
    },
    // {
    //   label: 'Repetition Penalty',
    //   min: 0,
    //   max: 2,
    //   step: 0.1,
    //   value: 1,
    // },
  ],
})

watch(
  settings.value,
  (newSettings) => {
    llmConfig.baseURL = newSettings.baseUrl
    llmConfig.apiKey = newSettings.apiKey
    llmConfig.model = newSettings.model
    llmConfig.temperature = newSettings.temperature
    llmConfig.maxTokens = newSettings.maxTokens
    llmConfig.systemPrompt = newSettings.systemPrompt
    llmConfig.topP = newSettings.advanced[0].value
    llmConfig.frequencyPenalty = newSettings.advanced[1].value
    llmConfig.presencePenalty = newSettings.advanced[2].value
  },
  { deep: true },
)

async function getConversations() {
  try {
    const { success, data } = await $fetch('/api/conversation')
    if (success && data) {
      conversations.value = (data.conversations ?? []).map((conversation) => {
        return {
          key: conversation.id,
          label: conversation.title,
        }
      })
    }
  }
  catch (error) {
    console.error(error)
    message.error('服务器异常，请稍后重试')
  }
}

async function getMessages(id: string) {
  try {
    const { success, data } = await $fetch<Promise<Api.Response<{ messages: (UserMessage | AssistantMessage)[] }>>>(`/api/conversation/${id}`)

    if (success && data) {
      const { messages } = data

      chatList.value = messages.reduce<Chat[]>((acc, message) => {
        if (message.role === 'user') {
          acc.push({
            userMessage: message,
            aiMessage: {} as AssistantMessage,
            status: 'success',
          })
        }
        else if (message.role === 'assistant' && acc.length > 0) {
          acc[acc.length - 1].aiMessage = message
        }
        return acc
      }, [])
    }
  }
  catch (error) {
    console.error(error)
    message.error(`Unable to load conversation ${id}`)
    navigateTo('/')
  }
  finally {
    loading.value = false
  }
}

async function scrollToBottom(element: HTMLElement | null) {
  if (element && !userScrolled.value) {
    await nextTick(() => {
      element.scrollTo({
        top: element.scrollHeight,
        behavior: 'smooth',
      })
    })
  }
}

function handleScroll() {
  if (container.value) {
    const { scrollTop, scrollHeight, clientHeight } = container.value
    if (scrollTop + clientHeight >= scrollHeight - 200) {
      userScrolled.value = false
    }
    else {
      userScrolled.value = true
    }
  }
}

onMounted(async () => {
  await getConversations()
  if (id.value) {
    conversationId.value = String(id.value)
    await getMessages(String(id.value))
    scrollToBottom(container.value)
  }
})

onMounted(async () => {
  await nextTick(() => {
    if (container.value) {
      container.value.addEventListener('scroll', handleScroll)
    }
  })
})
</script>

<template>
  <Flex v-auto-animate class="flex-1 max-h-full">
    <ChatLayout vertical class="w-full flex-1 relative flex h-full max-w-full overflow-hidden">
      <template #header>
        <AppHeader class="w-full h-14" title="Omnix" />
      </template>
      <Flex vertical align="center" class="w-full max-h-full overflow-y-auto flex-1 mb-2">
        <div ref="container" class="w-full flex justify-center items-center overflow-y-auto px-4">
          <Flex vertical gap="middle" class="w-full h-full max-w-3xl">
            <Bubble
              v-for="msg in displayChatList"
              :key="msg.id" :content="msg.content"
              :variant="msg.variant"
              :message-render="msg.messageRender"
              :placement="msg.placement"
              :loading="msg.loading"
            />
          </Flex>
        </div>
      </Flex>
      <Sender
        class="m-auto !max-w-[calc(48rem+25px)]"
        :loading="loading" :value="query" placeholder="Type your message here..."
        @update:value="query = $event"
        @submit="sendMessage"
        @cancel="stop"
      />
      <template #footer>
        <AppFooter />
      </template>
    </ChatLayout>
  </Flex>
</template>
