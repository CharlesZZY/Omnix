<script setup lang="ts">
import { Analytics } from '@vercel/analytics/nuxt'
import { XProvider } from 'ant-design-x-vue'
</script>

<template>
  <XProvider>
    <NuxtLayout>
      <Analytics />
      <NuxtRouteAnnouncer />
      <NuxtLoadingIndicator />
      <NuxtPage />
    </NuxtLayout>
  </XProvider>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  position: absolute;
  inset: 0;
}

#__omnix {
  height: 100%;
}

.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
