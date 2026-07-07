<script setup lang="ts">
const card = ref<HTMLElement | null>(null)
const rx = ref(0)
const ry = ref(0)

function move(event: MouseEvent) {
  const el = card.value
  if (!el) return
  const box = el.getBoundingClientRect()
  const x = (event.clientX - box.left) / box.width - 0.5
  const y = (event.clientY - box.top) / box.height - 0.5
  rx.value = y * -5
  ry.value = x * 6
}

function leave() {
  rx.value = 0
  ry.value = 0
}
</script>

<template>
  <div
    ref="card"
    class="tilt"
    :style="{ transform: `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg)` }"
    @mousemove="move"
    @mouseleave="leave"
  >
    <slot />
  </div>
</template>
