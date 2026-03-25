// composables/useAuth.ts
export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      return navigateTo('/auth/login')
    }
  }

  return {
    user,
    signOut
  }
}