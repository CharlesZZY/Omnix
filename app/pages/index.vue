<script setup lang="tsx">
import ConversationLayout from '~/layouts/conversation.vue'

definePageMeta({
  middleware: [
    'auth',
  ],
})
</script>

<template>
  <ConversationLayout />
</template>
