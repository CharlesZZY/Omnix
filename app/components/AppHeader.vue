<script setup lang="ts">
import type { Component } from 'vue'
import { Flex } from 'ant-design-vue'

withDefaults(defineProps<{
  title?: string
  tool?: Component
}>(), {
  title: 'Omnix',
})
</script>

<template>
  <Flex vertical>
    <Flex justify="space-between" align="center" class="w-full h-full p-4">
      <span class="text-2xl font-bold">{{ title }}</span>
      <component :is="tool" v-if="tool" />
    </Flex>
    <!-- <Divider class="m-0" /> -->
  </Flex>
</template>
