<script setup lang="ts">
import ConversationLayout from '~/layouts/conversation.vue'

definePageMeta({
  pageTransition: false,
  layoutTransition: false,
  middleware: [
    'auth',
  ],
})
</script>

<template>
  <ConversationLayout />
</template>
