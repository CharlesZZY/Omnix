<script setup lang="ts">
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
