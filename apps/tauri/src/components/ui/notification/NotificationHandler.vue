<script setup lang="ts">
const { notifications, dismiss: removeNotification } = useNotification()
</script>

<template>
  <div class="pointer-events-none">
    <Notification
      v-for="notification of notifications"
      :key="notification.id"
      :notification="notification"
      @remove="removeNotification(notification)"
    ></Notification>
  </div>
</template>

<style scoped></style>
