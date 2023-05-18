export const waitForNavigation = () => {
  return new Promise<void>((resolve) => setTimeout(resolve, 60 * 1000))
}

// avoid flashing the page on external redirects
export const navigateToWithoutFlash = async (url: string, options: { external?: boolean } = {}) => {
  if (process.server) {
    return navigateTo(url, options)
  }
  await navigateTo(url, options)
  await waitForNavigation()
}
