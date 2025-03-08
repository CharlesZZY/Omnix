<script setup lang="ts">
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons-vue'
import { Button, Form, FormItem, Input, InputPassword, message } from 'ant-design-vue'

definePageMeta({
  layout: false,
})

const formData = reactive({
  username: '',
  password: '',
  email: '',
})
const loading = ref(false)

async function handleRegister() {
  if (!formData.username || !formData.password || !formData.email) {
    message.warning('请填写完整信息')
    return
  }

  loading.value = true
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: formData,
    })
    message.success('注册成功')
    await navigateTo('/login')
  }
  catch (error) {
    console.error(error)

    message.error('注册失败，请稍后重试')
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
          注册
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          创建您的账号以开始使用
        </p>
      </div>

      <Form :model="formData" layout="vertical" class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <FormItem
          name="username"
          :rules="[{ required: true, message: '请输入用户名' }]"
        >
          <Input
            v-model:value="formData.username"
            size="large"
            placeholder="用户名"
          >
            <template #prefix>
              <UserOutlined class="text-gray-400" />
            </template>
          </Input>
        </FormItem>

        <FormItem
          name="email"
          :rules="[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]"
        >
          <Input
            v-model:value="formData.email"
            size="large"
            placeholder="邮箱地址"
          >
            <template #prefix>
              <MailOutlined class="text-gray-400" />
            </template>
          </Input>
        </FormItem>

        <FormItem
          name="password"
          :rules="[{ required: true, message: '请输入密码' }]"
        >
          <InputPassword
            v-model:value="formData.password"
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
            立即注册
          </Button>

          <Button
            type="default"
            size="large"
            class="flex-1"
            @click="navigateTo('/login')"
          >
            返回登录
          </Button>
        </div>
      </Form>
    </div>
  </div>
</template>
