<script setup lang="tsx">
import type { BubbleListProps, ConversationsProps } from 'ant-design-x-vue'
import type { AssistantMessage, Chat, ChatSettings, EventStreamMessage, UserMessage } from '~/types/chat'
import { ClientOnly } from '#components'
import { Collapse, CollapsePanel, Flex, Form, FormItem, Input, InputPassword, message, Select, SelectOption, Slider, Textarea } from 'ant-design-vue'
import { BubbleList, Conversations, Sender } from 'ant-design-x-vue'
import { MdPreview } from 'md-editor-v3'
import { v4 as uuidv4 } from 'uuid'
import { computed, ref } from 'vue'
import ChatLayout from '~/layouts/chat.vue'
import Sider from '~/layouts/sider.vue'
import { useLLMConfigStore } from '~/stores/LLMConfig'
import 'md-editor-v3/lib/preview.css'

defineOptions({ name: 'ConversationLayout' })

const route = useRoute()
const router = useRouter()
const llmConfig = useLLMConfigStore()

const id = ref(route.params.id)

const container = ref<HTMLElement | null>(null)
const listRef = ref<InstanceType<typeof BubbleList> | null>(null)
const chatList = ref<Chat[]>([])
const conversationId = ref<string>('')
const loading = ref<boolean>(false)
const query = ref<string>('')

const displayChatList = computed(() =>
  chatList.value.reduce((acc, { userMessage, aiMessage }, index, array) => {
    const isLast = index === array.length - 1
    acc.push(
      { id: userMessage.id, role: userMessage.role, content: userMessage.content },
      { id: aiMessage.id, role: aiMessage.role, content: aiMessage.content, loading: isLast && getLastChat().status === 'pending' },
    )
    return acc
  }, [] as { id: string, role: string, content: string, loading?: boolean }[]),
)

function getLastChat() {
  return chatList.value[chatList.value.length - 1]
}

const roles: BubbleListProps['roles'] = {
  user: {
    // header: 'User',
    placement: 'end',
  },
  assistant: {
    // header: 'Assistant',
    placement: 'start',
    variant: 'outlined',
    messageRender: content => (
      <MdPreview autoFoldThreshold={10000} modelValue={content} />
    ),
  },
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
          break
        }
        case 'title_generation': {
          const { title } = JSON.parse(ev.data)
          console.log('title', title)

          break
        }
        case 'conversation_detail_metadata': {
          const { conversationId: id } = JSON.parse(ev.data)
          conversationId.value = id
          window.history.replaceState(null, '', `/chat/${id}`)
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
}

function stop() {
  loading.value = false
}

const conversations = ref<ConversationsProps['items']>([])

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

const activeKey = ref<string>('')

interface ReturnType {
  success: boolean
  data: {
    messages: (UserMessage | AssistantMessage)[]
  }
}

async function getMessages(id: string) {
  try {
    const { success, data } = await $fetch<ReturnType>(`/api/conversation/${id}`)

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
    message.error('服务器异常，请稍后重试')
  }
  finally {
    loading.value = false
  }
}

async function scrollToBottom(element: HTMLElement | null) {
  if (element) {
    await nextTick(() => {
      element.scrollTo({
        top: element.scrollHeight,
        behavior: 'smooth',
      })
    })
  }
}

onMounted(async () => {
  await getConversations()
  if (id.value) {
    conversationId.value = String(id.value)
    activeKey.value = String(id.value)
    await getMessages(String(id.value))
    scrollToBottom(container.value)
  }
})

async function changeConversation(id: string) {
  await navigateTo(`/chat/${id}`)
}
</script>

<template>
  <Flex class="flex-1 max-h-full">
    <ClientOnly>
      <Sider class="w-80 resize-none max-h-full h-full">
        <template #header>
          <AppHeader class="w-full h-14" title="Settings & Conversations" />
        </template>
        <template #settings>
          <Flex justify="center">
            <Form layout="vertical" class="w-full">
              <!-- 基础配置 -->
              <FormItem label="Base URL">
                <Input v-model:value="settings.baseUrl" placeholder="请输入base_url">
                  <!-- <template #addonBefore>
                    <Select v-model:value="settings.baseUrlPrefix">
                      <SelectOption value="http://">
                        http://
                      </SelectOption>
                      <SelectOption value="https://">
                        https://
                      </SelectOption>
                    </Select>
                  </template> -->
                </Input>
              </FormItem>

              <FormItem label="Api Key">
                <InputPassword v-model:value="settings.apiKey" placeholder="请输入Api Key" />
              </FormItem>

              <FormItem label="Model">
                <Input v-model:value="settings.model" placeholder="请输入model" />
              </FormItem>

              <FormItem label="Temperature">
                <Slider v-model:value="settings.temperature" :min="0" :max="2" :step="0.1" />
              </FormItem>

              <FormItem label="Max Tokens">
                <Slider v-model:value="settings.maxTokens" :min="1" :max="4096" :step="1" />
              </FormItem>

              <FormItem label="System Prompt">
                <Textarea v-model:value="settings.systemPrompt" :rows="4" placeholder="请输入系统提示词" />
              </FormItem>

              <!-- 高级配置 -->
              <Collapse>
                <CollapsePanel key="1" header="高级设置">
                  <FormItem v-for="item in settings.advanced" :key="item.label" :label="item.label">
                    <Slider v-model:value="item.value" :min="item.min" :max="item.max" :step="item.step" />
                  </FormItem>
                </CollapsePanel>
              </Collapse>
            </Form>
          </Flex>
        </template>
        <template #conversations>
          <div>
            <Conversations class="px-0 py-0 mt-0 max-w-full h-auto overflow-hidden" :items="conversations" :active-key="activeKey" @active-change="changeConversation" />
          </div>
        </template>
      </Sider>
      <ChatLayout vertical class="w-full flex-1 relative flex h-full max-w-full overflow-hidden">
        <template #header>
          <AppHeader class="w-full h-14" title="Omnix" />
        </template>
        <Flex vertical align="center" class="w-full max-h-full overflow-y-auto flex-1 p-4">
          <div ref="container" class="w-full flex justify-center items-center overflow-y-auto px-4">
            <div class="w-full h-full max-w-3xl">
              <BubbleList ref="listRef" :roles="roles" :items="displayChatList" />
            </div>
          </div>
        </Flex>
        <Sender
          class="m-auto max-w-3xl"
          :loading="loading" :value="query" placeholder="Type your message here..."
          @update:value="query = $event"
          @submit="sendMessage"
          @cancel="stop"
        />
        <template #footer>
          <AppFooter />
        </template>
      </ChatLayout>
    </ClientOnly>
  </Flex>
</template>
