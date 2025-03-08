export default defineNuxtRouteMiddleware((to) => {
  if (to.fullPath === '/chat') {
    return navigateTo('/')
  }

  const { loggedIn } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo('/login')
  }
})
