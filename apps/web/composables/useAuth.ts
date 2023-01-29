export const useAuth = () => {
  const { data: session, signOut } = useSession()

  const logOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const isLoggedIn = computed(() => !!session)

  // export session.value.user as reactive object
  const user = computed(() => session.value?.user)

  const accessToken = computed(() => session.value?.accessToken)

  return { session, logOut, isLoggedIn, user, accessToken }
}
