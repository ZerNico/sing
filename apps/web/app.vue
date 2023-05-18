<script setup lang="ts">
import '@fontsource/open-sans/latin.css'
</script>

<template>
  <div class="font-primary text-foreground h-full relative">
    <NuxtLayout>
      <NuxtLoadingIndicator />
      <NuxtPage />
    </NuxtLayout>
    <UiNotificationHandler class="absolute top-0 right-0 z-2" />
  </div>
</template>

<style>
body,
html,
#__nuxt {
  height: 100%;
}

body {
  --at-apply: bg-background;
}

:root {
  --background: 224, 71%, 4%;
  --foreground: 213, 31%, 91%;

  --muted: 223, 47%, 11%;
  --muted-foreground: 215.4, 16.3%, 56.9%;

  --accent: 216, 34%, 17%;
  --accent-foreground: 210, 40%, 98%;

  --popover: 224, 71%, 4%;
  --popover-foreground: 215, 20.2%, 65.1%;

  --border: 216, 34%, 17%;
  --input: 216, 34%, 17%;

  --card: 224, 71%, 4%;
  --card-foreground: 213, 31%, 91%;

  --primary: 210, 40%, 98%;
  --primary-foreground: 222.2, 47.4%, 1.2%;

  --secondary: 222.2, 47.4%, 11.2%;
  --secondary-foreground: 210, 40%, 98%;

  --destructive: 0, 63%, 50%;
  --destructive-foreground: 210, 40%, 98%;

  --ring: 216, 34%, 17%;

  --radius: 0.5rem;
}

* {
  --at-apply: border-border;
}
</style>
