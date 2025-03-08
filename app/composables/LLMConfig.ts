import type { LLMConfig } from '~/types/chat'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useLLMConfigStore = defineStore('llmConfigStore', () => {
  const baseURL = ref<string>('https://api.example.com')
  const apiKey = ref<string>('')
  const model = ref<string>('')
  const temperature = ref(1)
  const maxTokens = ref(2048)
  const systemPrompt = ref<string>('')
  const topP = ref(1)
  const frequencyPenalty = ref(0)
  const presencePenalty = ref(0)

  const getConfig = computed<LLMConfig>(() => ({
    baseURL: baseURL.value,
    apiKey: apiKey.value,
    model: model.value,
    temperature: temperature.value,
    maxTokens: maxTokens.value,
    systemPrompt: systemPrompt.value,
    topP: topP.value,
    frequencyPenalty: frequencyPenalty.value,
    presencePenalty: presencePenalty.value,
  }))

  return {
    baseURL,
    apiKey,
    model,
    temperature,
    maxTokens,
    systemPrompt,
    topP,
    frequencyPenalty,
    presencePenalty,
    getConfig,
  }
}, {
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
  },
})
