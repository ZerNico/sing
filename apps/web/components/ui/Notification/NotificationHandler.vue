<script setup lang="ts">
const { notifications, dismiss: removeNotification } = useNotification()
</script>

<template>
  <div class="w-full flex flex-col items-end p-6 pointer-events-none overflow-hidden">
    <UiNotification
      v-for="notification of notifications"
      :key="notification.id"
      :notification="notification"
      @remove="removeNotification(notification)"
    ></UiNotification>
  </div>
</template>

<style scoped></style>
