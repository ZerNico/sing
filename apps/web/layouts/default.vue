<template>
  <div class="gradient-bg-main min-h-full grid grid-rows-[max-content]">
    <NavBar class="sticky top-0">
      <NuxtLink to="/join">
        <Button class="bg-gradient-to-r from-indigo-500 to-blue-500 hover:ring-indigo-500">
          <span>Join Lobby</span>
        </Button>
      </NuxtLink>
    </NavBar>
    <slot />
  </div>
</template>
