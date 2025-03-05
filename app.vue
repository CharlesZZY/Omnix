<script setup lang="ts">
import { XProvider } from 'ant-design-x-vue'
</script>

<template>
  <XProvider>
    <NuxtRouteAnnouncer />

    <NuxtLoadingIndicator />

    <!-- <AppHeader /> -->

    <main class="w-full h-full">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </main>

    <!-- <AppFooter /> -->
  </XProvider>
</template>

<style>
body {
  margin: 0;
  padding: 0;
}

#__omnix {
  width: 100vw !important;
  height: 100vh !important;
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
