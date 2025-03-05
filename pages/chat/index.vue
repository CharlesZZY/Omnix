<script setup lang="tsx">
import type { EventSourceMessage } from '@microsoft/fetch-event-source'
import type { BubbleListProps, ConversationsProps } from 'ant-design-x-vue'
import type { AssistantMessage, Chat, UserMessage } from '~/types/chat'
import { CommentOutlined, CopyOutlined, SyncOutlined } from '@ant-design/icons-vue'
import { Button, Flex, Space } from 'ant-design-vue'
import { BubbleList, Conversations, Sender } from 'ant-design-x-vue'
import { MdPreview } from 'md-editor-v3'
import { v4 as uuidv4 } from 'uuid'
import { computed, ref } from 'vue'
import 'md-editor-v3/lib/preview.css'

defineOptions({ name: 'Chat' })

const listRef = ref<InstanceType<typeof BubbleList> | null>(null)

const chatList = ref<Chat[]>([])
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
    footer: (
      <Space>
        <Button type="text" size="small" icon={<SyncOutlined />} />
        <Button type="text" size="small" icon={<CopyOutlined />} />
      </Space>
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
    id: uuidv4(),
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

async function sendMessage(query: string) {
  if (!query || loading.value) {
    return
  }
  const messages = chatList.value.flatMap(({ userMessage, aiMessage }) => [
    { role: userMessage.role, content: userMessage.content },
    { role: aiMessage.role, content: aiMessage.content },
  ])

  ready(query)

  const lastChat = getLastChat()

  messages.push({ role: lastChat.userMessage.role, content: lastChat.userMessage.content })

  async function onOpen(_response: Response): Promise<void> {
    lastChat.status = 'loading'
    return await Promise.resolve()
  }
  function onMessage(ev: EventSourceMessage): void {
    if (ev.event === 'end') {
      lastChat.status = 'success'
      return
    }
    try {
      const data = JSON.parse(ev.data)
      if (lastChat.aiMessage.role === 'assistant') {
        lastChat.aiMessage.content += data
      }
    }
    catch (error) {
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
  }, onOpen, onMessage, onClose, onError)

  loading.value = false
}

function stop() {
  loading.value = false
}

const style = computed(() => ({
  background: 'rgba(0, 0, 0, 0.05)',
}))

const items: ConversationsProps['items'] = Array.from({ length: 4 }).map((_, index) => ({
  key: `item${index + 1}`,
  label: `Conversation Item ${index + 1}`,
  group: index === 3 ? 'Group2' : 'Group1',
}))

// const groupable: ConversationsProps['groupable'] = {
//   sort(a, b) {
//     if (a === b)
//       return 0

//     return a === 'Group2' ? -1 : 1
//   },
//   title: (group, { components: { GroupTitle } }) =>
//     group
//       ? (
//           <GroupTitle>
//             <Space>
//               <CommentOutlined />
//               <span>{group}</span>
//             </Space>
//           </GroupTitle>
//         )
//       : (
//           <GroupTitle />
//         ),
// }
</script>

<template>
  <Flex class="h-full">
    <!-- <Conversations class="w-52 px-8 mt-0 h-full" :style="style" :groupable="groupable" default-active-key="item1" :items="items" /> -->
    <Flex vertical class="w-full flex-1 relative flex h-full max-w-full overflow-hidden">
      <Flex vertical align="center" class="w-full flex-1 overflow-y-auto p-4">
        <ClientOnly>
          <BubbleList
            ref="listRef"
            class="w-full max-w-3xl px-4"
            :roles="roles"
            :items="displayChatList"
          />
        </ClientOnly>
      </Flex>
      <Sender
        class="m-auto max-w-3xl"
        :loading="loading" :value="query" placeholder="Type your message here..."
        @update:value="query = $event"
        @submit="sendMessage"
        @cancel="stop"
      />
      <AppFooter />
    </Flex>
  </Flex>
</template>
