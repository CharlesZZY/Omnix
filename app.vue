<script setup lang="ts">
import { theme } from 'ant-design-vue'
import { XProvider } from 'ant-design-x-vue'
</script>

<template>
  <XProvider>
    <NuxtLayout>
      <!-- <AppHeader /> -->
      <NuxtRouteAnnouncer />
      <NuxtLoadingIndicator />
      <NuxtPage />
      <!-- <AppFooter /> -->
    </NuxtLayout>
  </XProvider>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  /* overflow: hidden; */
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
