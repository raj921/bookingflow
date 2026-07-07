<script setup lang="ts">
useHead({
  title: 'Tickete booking flow',
  meta: [{ name: 'description', content: 'Book a Tickete experience with live slot availability.' }]
})
</script>

<template>
  <BookingFlow :id="101" />
</template>
