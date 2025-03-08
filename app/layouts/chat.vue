<script setup lang="ts">
import { Flex } from 'ant-design-vue'

defineOptions({
  name: 'ChatLayout',
})
</script>

<template>
  <Flex vertical>
    <slot name="header" />
    <slot />
    <slot name="footer" />
  </Flex>
</template>
