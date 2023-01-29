<template>
  <nav class="flex justify-between flex-shrink-0 h-16 px-10 items-center border-b border-black/30 bg-indigo-900/95 supports-backdrop-blur:bg-black/15 backdrop-blur">
    <RouterLink to="/">
      <div class="text-white font-semibold text-xl ">
        Tune Perfect
      </div>
    </RouterLink>
    <div>
      <slot />
    </div>
  </nav>
</template>
