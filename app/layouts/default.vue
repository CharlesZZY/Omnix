<script setup lang="tsx">
import type { ConversationsProps } from 'ant-design-x-vue'
import type { Api } from '~/types/api'
import type { ChatSettings } from '~/types/chat'
import { DeleteOutlined } from '@ant-design/icons-vue'
import { vAutoAnimate } from '@formkit/auto-animate'
import { Button, Collapse, CollapsePanel, Flex, Form, FormItem, Input, InputPassword, message, Slider, Textarea } from 'ant-design-vue'
import { Conversations } from 'ant-design-x-vue'
import SiderLayout from '~/layouts/sider.vue'
import 'md-editor-v3/lib/preview.css'

const route = useRoute()
const llmConfig = useLLMConfigStore()

const conversationId = ref<string>('')
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

async function changeConversation(id: string) {
  await navigateTo(`/chat/${id}`)
}

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

const menuConfig: ConversationsProps['menu'] = conversation => ({
  items: [
    {
      label: '删除',
      key: 'delete',
      icon: <DeleteOutlined />,
      danger: true,
    },
  ],
  onClick: async () => {
    const { success } = await $fetch<Promise<Api.Response>>(`/api/conversation/${conversation.key}`, {
      method: 'DELETE',
    })
    success ? message.success('删除成功') : message.error('服务器异常，请稍后重试')
    if (conversationId.value === conversation.key) {
      navigateTo('/')
    }
    await getConversations()
  },
})

onMounted(async () => {
  await getConversations()
})

watch(() => route.params.id, async (value) => {
  if (value) {
    await getConversations()
    conversationId.value = String(value)
  }
}, {
  immediate: true,
})
</script>

<template>
  <Flex vertical class="w-full h-full flex-1">
    <Flex class="w-full max-h-full flex-1">
      <SiderLayout class="w-80 resize-none max-h-full h-full">
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
                <Slider v-model:value="settings.maxTokens" :min="1" :max="8192" :step="1" />
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
            <ClientOnly>
              <Button type="text" class="w-full text-start mb-2 px-2 h-10" @click="navigateTo('/')">
                开启新对话
              </Button>
              <Conversations v-auto-animate class="px-0 py-0 mt-0 max-w-full h-auto overflow-hidden" :items="conversations" :active-key="conversationId" :menu="menuConfig" @active-change="changeConversation" />
            </ClientOnly>
          </div>
        </template>
      </SiderLayout>
      <slot />
    </Flex>
  </Flex>
</template>
