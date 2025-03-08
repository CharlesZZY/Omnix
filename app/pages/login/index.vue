<script setup lang="ts">
import { LockOutlined, UserOutlined } from '@ant-design/icons-vue'
import { Button, Form, FormItem, Input, InputPassword, message } from 'ant-design-vue'

definePageMeta({
  layout: false,
})

const { fetch: refreshSession } = useUserSession()
const credentials = reactive({
  username: '',
  password: '',
})
const loading = ref(false)

async function login() {
  if (!credentials.username || !credentials.password) {
    message.warning('请输入用户名和密码')
    return
  }

  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: credentials,
    })
    await refreshSession()
    message.success('登录成功')
    await navigateTo('/')
  }
  catch (error) {
    console.error(error)
    message.error('用户名或密码错误')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">
          登录
        </h2>
      </div>

      <Form layout="vertical" class="mt-8 space-y-6" @submit.prevent="login">
        <FormItem>
          <Input
            v-model:value="credentials.username"
            size="large"
            placeholder="用户名"
          >
            <template #prefix>
              <UserOutlined class="text-gray-400" />
            </template>
          </Input>
        </FormItem>

        <FormItem>
          <InputPassword
            v-model:value="credentials.password"
            size="large"
            placeholder="密码"
          >
            <template #prefix>
              <LockOutlined class="text-gray-400" />
            </template>
          </InputPassword>
        </FormItem>

        <div class="flex space-x-4">
          <Button
            type="primary"
            html-type="submit"
            size="large"
            :loading="loading"
            class="flex-1"
          >
            登录
          </Button>

          <Button
            type="default"
            size="large"
            class="flex-1"
            @click="navigateTo('/register')"
          >
            注册
          </Button>
        </div>
      </Form>
    </div>
  </div>
</template>
