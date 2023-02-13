export const useAuth = () => {
  const { data: session, signOut, signIn } = useSession()

  const logOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const logIn = async (options?: { callbackUrl?: string }) => {
    const callbackUrl = options?.callbackUrl

    await signIn(undefined, { callbackUrl })
  }

  const isLoggedIn = computed(() => !!session)

  // export session.value.user as reactive object
  const user = computed(() => session.value?.user)

  const accessToken = computed(() => session.value?.accessToken)

  return { session, logOut, isLoggedIn, user, accessToken, logIn }
}
