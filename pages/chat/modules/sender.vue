<script setup lang="ts">
import { Flex, message } from 'ant-design-vue'
import { Sender } from 'ant-design-x-vue'
import { ref } from 'vue'

defineOptions({ name: 'AXSenderBasic' })

const value = ref('Hello? this is X!')
const loading = ref<boolean>(false)

async function handleSubmit() {
  value.value = ''
  loading.value = true
  const { data } = await useFetch('/api/chat')
  console.log(data.value)
  message.info('Send message!')
}

function handleCancel() {
  loading.value = false
  message.error('Cancel sending!')
}
</script>

<template>
  <Flex vertical gap="middle">
    <Sender
      :loading="loading"
      :value="value"
      @update:value="value = $event"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </Flex>
</template>
