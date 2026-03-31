// composables/useAuth.ts
export const useAuth = () => {
  const authStore = useAuthStore()

  const user = computed(() => authStore.user)
  const token = computed(() => authStore.token)
  const isAuthenticated = computed(() => authStore.isAuthenticated)

  const signOut = async () => {
    await authStore.signOut()
  }

  return {
    user,
    token,
    isAuthenticated,
    signOut,
  }
}

