<script setup lang="ts">
const route = useRoute()
const id = computed(() => Number(route.params.id) || 101)

useHead({
  title: 'Tickete booking flow',
  meta: [{ name: 'description', content: 'Book a Tickete experience with live slot availability.' }]
})
</script>

<template>
  <BookingFlow :id="id" />
</template>
