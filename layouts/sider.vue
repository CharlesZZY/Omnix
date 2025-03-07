<script setup lang="ts">
import { Divider, Flex } from 'ant-design-vue'

defineOptions({
  name: 'Sider',
})
</script>

<template>
  <Flex class="h-full bg-gray-50">
    <Flex vertical gap="small" class="w-full h-full ">
      <slot name="header" />
      <Flex vertical gap="small" class="p-4 w-full flex-1 overflow-y-auto">
        <slot name="settings" />
        <slot name="conversations" />
      </Flex>
    </Flex>
    <Divider type="vertical" class="h-full m-0" />
  </Flex>
</template>
