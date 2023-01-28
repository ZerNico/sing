<template>
  <div class="gradient-bg-main min-h-screen relative relative">
    <nav class="absolute inset-0 flex justify-between h-16 px-10 items-center border-b border-black/30 bg-indigo-900/95 supports-backdrop-blur:bg-black/15 backdrop-blur">
      <div class="text-white font-semibold text-xl ">
        Tune Perfect
      </div>
      <div>
        <NuxtLink to="/join">
          <button class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-500 to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500">
            <span>Join Lobby</span>
          </button>
        </NuxtLink>
      </div>
    </nav>

    <slot />
  </div>
</template>

<style scoped>

</style>
