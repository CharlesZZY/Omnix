<script setup lang="ts">
import { Flex, message } from 'ant-design-vue'
import { Sender } from 'ant-design-x-vue'
import { ref } from 'vue'

defineOptions({ name: 'Sender' })

const value = ref('Hello? this is X!')
const loading = ref<boolean>(false)

async function handleSubmit() {
  value.value = ''
  loading.value = true
  const res = await $fetch<ReadableStream>('/api/chat', {
    method: 'POST',
    responseType: 'stream',
  })
  const reader = res.pipeThrough(new TextDecoderStream()).getReader()

  while (true) {
    const { value, done } = await reader.read()

    if (done)
      break

    console.log('Received:', value)
  }
  message.info('Send message!')
}

function handleCancel() {
  loading.value = false
  message.error('Cancel sending!')
}

onMounted(async () => {
  const res = await $fetch('/api/user/stat')
  console.log(res)
})
</script>

<template>
  <Flex vertical gap="middle">
    <Sender
      :loading="loading" :value="value" @update:value="value = $event" @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </Flex>
</template>
