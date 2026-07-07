<script setup lang="ts">
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, Languages, LockKeyhole, Mail, MapPin, Minus, Plus, RefreshCw, ShieldCheck, Ticket, X } from '@lucide/vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type Pax = 'Adult' | 'Senior' | 'Child'
type Counts = Record<Pax, number>
type Limit = Record<Pax, number>
type Slot = { id: string; startTime: string; capacity?: number; remaining: unknown; limits: Limit; seats: number }
type Media = { type: 'image' | 'video'; url: string; thumbnail?: string; caption?: string }
type Experience = {
  id: number
  title: string
  image: string
  price: number | string
  currency: string
  cancellationPolicy: string
  soldOut: boolean
  description: string
  highlights: string[]
  duration: string
  languages: string[]
  meetingPoint: string
  included: string[]
  excluded: string[]
  importantInfo: string[]
  rating: number
  reviewCount: number
  media: Media[]
}

const props = defineProps<{ id: number }>()
const paxTypes: Pax[] = ['Adult', 'Senior', 'Child']
const labels: Record<Pax, string> = { Adult: 'Ages 18-64', Senior: 'Ages 65+', Child: 'Ages 4-17' }
const counts = reactive<Counts>({ Adult: 1, Senior: 0, Child: 0 })
const form = reactive({ name: '', email: '' })
const picked = ref('')
const ok = ref<any>(null)
const err = ref('')
const busy = ref(false)
const photo = ref(0)
const query = computed(() => `/api/experience/${props.id}`)
const { data, pending, error, refresh } = await useFetch<{ experience: Experience; slots: Slot[] }>(query, { watch: [query] })

const exp = computed(() => data.value?.experience)
const slots = computed(() => data.value?.slots || [])
const slot = computed(() => slots.value.find(item => item.id === picked.value) || slots.value[0] || null)
const imgs = computed(() => {
  const media = exp.value?.media?.map(item => item.type === 'video' ? item.thumbnail : item.url).filter(Boolean) as string[] || []
  return [exp.value?.image, ...media].filter(Boolean) as string[]
})
const limit = computed<Limit>(() => slot.value?.limits || { Adult: 0, Senior: 0, Child: 0 })
const price = computed(() => Number(exp.value?.price || 0))
const totalGuests = computed(() => paxTypes.reduce((sum, type) => sum + counts[type], 0))
const total = computed(() => totalGuests.value * price.value)
const canBook = computed(() => !!slot.value && totalGuests.value > 0 && !!form.name.trim() && /^\S+@\S+\.\S+$/.test(form.email) && !busy.value)
const soldOut = computed(() => !!exp.value?.soldOut || slots.value.length === 0 || slots.value.every(item => item.seats < 1))

watch(slot, next => {
  if (!next) return
  paxTypes.forEach(type => {
    counts[type] = Math.min(counts[type], next.limits[type])
  })
}, { immediate: true })

watch(slots, next => {
  if (!picked.value && next[0]) picked.value = next[0].id
}, { immediate: true })

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  const ctx = gsap.context(() => {
    gsap.from('.rise', { y: 18, opacity: 0, stagger: 0.06, duration: 0.55, ease: 'power3.out' })
    gsap.to('.media-scale', { scale: 1, opacity: 1, duration: 0.7, ease: 'power3.out' })
    gsap.to('.reveal-line', {
      opacity: 1,
      y: 0,
      stagger: 0.08,
      scrollTrigger: { trigger: '.desire', start: 'top 70%' },
      duration: 0.45,
      ease: 'power3.out'
    })
  })
  return () => ctx.revert()
})

function money(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: exp.value?.currency || 'EUR' }).format(value)
}

function time(value: string) {
  const date = new Date(value.endsWith('Z') ? value : `${value}Z`)
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
}

function inc(type: Pax) {
  if (counts[type] >= limit.value[type]) return
  counts[type] += 1
  err.value = ''
}

function dec(type: Pax) {
  counts[type] = Math.max(0, counts[type] - 1)
}

function pick(id: string) {
  picked.value = id
  ok.value = null
  err.value = ''
}

function msg(e: any) {
  const status = e?.statusCode || e?.status
  if (status === 409) return 'That slot just changed. Pick another time or lower the guest count.'
  if (status === 429) return 'Too many tries in a short time. Wait a moment and try again.'
  if (status >= 500) return 'The booking service is having a moment. Try again soon.'
  return e?.statusMessage || e?.data?.message || 'We could not place this booking.'
}

async function book() {
  err.value = ''
  ok.value = null
  if (!canBook.value || !slot.value || !exp.value) return
  busy.value = true
  try {
    ok.value = await $fetch('/api/bookings', {
      method: 'POST',
      body: {
        experienceId: exp.value.id,
        slotId: slot.value.id,
        pax: counts,
        customerName: form.name,
        customerEmail: form.email
      }
    })
  } catch (e) {
    err.value = msg(e)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <main class="min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-[#f7f4ee] text-[#1f1d1a]">
    <div class="fixed inset-0 pointer-events-none noise" />
    <nav class="mx-auto flex max-w-[1480px] items-center justify-between border-b border-[#ded6ca] px-5 py-5 md:px-10">
      <NuxtLink to="/" class="brand rise" aria-label="Tickete home">
        <span class="mark">t</span>
        <span>tickete</span>
      </NuxtLink>
      <div class="hidden items-center gap-10 text-sm text-[#5e564c] md:flex">
        <span>Experiences</span>
        <span>Destinations</span>
        <span>Collections</span>
      </div>
      <NuxtLink class="nav-action rise" :to="`/${id === 106 ? 101 : 106}`">
        {{ id === 106 ? 'Open bookable' : 'View sold out' }}
      </NuxtLink>
    </nav>

    <section v-if="pending" class="mx-auto grid max-w-[1480px] gap-6 px-5 py-10 md:grid-cols-12 md:px-10">
      <div class="skeleton h-[560px] md:col-span-9" />
      <div class="skeleton h-[560px] md:col-span-3" />
    </section>

    <section v-else-if="error" class="mx-auto max-w-2xl px-5 py-24 text-center">
      <div class="error-box">
        <X :size="22" />
        <h1>Could not load this experience</h1>
        <p>{{ error.statusMessage || 'Try again in a moment.' }}</p>
        <button class="primary" @click="() => refresh()">
          <RefreshCw :size="16" />
          Retry
        </button>
      </div>
    </section>

    <section v-else-if="exp" class="mx-auto grid max-w-[1480px] grid-flow-dense gap-6 px-5 py-8 md:grid-cols-12 md:px-10 md:py-12">
      <div class="space-y-9 md:col-span-7">
        <NuxtLink to="/" class="back rise">
          <ChevronLeft :size="17" />
          Back to experiences
        </NuxtLink>

        <FloatingCard>
          <div class="media-card media-scale">
            <img :src="imgs[photo] || exp.image" :alt="exp.title" />
            <div class="media-count">{{ photo + 1 }} / {{ imgs.length || 1 }}</div>
            <div class="media-buttons">
              <button aria-label="Previous image" @click="photo = (photo + imgs.length - 1) % imgs.length">
                <ChevronLeft :size="20" />
              </button>
              <button aria-label="Next image" @click="photo = (photo + 1) % imgs.length">
                <ChevronRight :size="20" />
              </button>
            </div>
          </div>
        </FloatingCard>

        <div class="rise space-y-5">
          <div class="flex items-center gap-2 text-sm text-[#6a6259]">
            <MapPin :size="17" />
            {{ exp.meetingPoint?.split(',').slice(-2).join(',').trim() || 'Meeting point confirmed after booking' }}
          </div>
          <h1 class="max-w-[760px] text-[clamp(2.35rem,5vw,4.85rem)] font-semibold leading-[0.95] tracking-[-0.055em]">
            {{ exp.title }}
          </h1>
          <p class="max-w-[68ch] text-lg leading-8 text-[#5d554b]">
            {{ exp.description }}
          </p>
        </div>

        <div class="rise grid gap-3 border-y border-[#ded6ca] py-5 sm:grid-cols-3">
          <div class="fact"><Clock3 :size="18" /><span>{{ exp.duration }}</span></div>
          <div class="fact"><Languages :size="18" /><span>{{ exp.languages?.join(', ') }}</span></div>
          <div class="fact"><ShieldCheck :size="18" /><span>{{ exp.cancellationPolicy }}</span></div>
        </div>

        <section class="desire grid gap-8 pb-20 md:grid-cols-2">
          <div>
            <h2 class="section-title reveal-line">What makes it worth booking</h2>
            <ul class="mt-5 space-y-3">
              <li v-for="item in exp.highlights" :key="item" class="check-row reveal-line">
                <Check :size="16" />
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
          <div>
            <h2 class="section-title reveal-line">Included</h2>
            <ul class="mt-5 space-y-3">
              <li v-for="item in exp.included" :key="item" class="check-row reveal-line">
                <Ticket :size="16" />
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
        </section>
      </div>

      <aside class="hidden space-y-4 md:col-span-2 md:block">
        <button
          v-for="(src, index) in imgs.slice(0, 3)"
          :key="src"
          class="thumb rise"
          :class="{ active: index === photo }"
          @click="photo = index"
        >
          <img :src="src" :alt="`${exp.title} media ${index + 1}`" />
        </button>
      </aside>

      <aside class="md:col-span-3">
        <div class="booking rise">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="eyebrow">Book this experience</p>
              <h2>{{ exp.title.replace(/&.*/, '').trim() }}</h2>
            </div>
            <div class="price">
              <span>{{ money(price) }}</span>
              <small>per guest</small>
            </div>
          </div>

          <div v-if="soldOut" class="state bad">
            This experience is sold out right now. Try a different experience from the header.
          </div>

          <template v-else>
            <div class="step">
              <div class="step-head">
                <span>1</span>
                <strong>Choose a slot</strong>
              </div>
              <div class="slot-grid">
                <button
                  v-for="item in slots"
                  :key="item.id"
                  class="slot"
                  :class="{ selected: item.id === picked, low: item.seats <= 2 }"
                  :disabled="item.seats < 1"
                  @click="pick(item.id)"
                >
                  <CalendarDays :size="15" />
                  <span>{{ time(item.startTime) }}</span>
                  <small>{{ item.seats }} left</small>
                </button>
              </div>
            </div>

            <div class="step">
              <div class="step-head">
                <span>2</span>
                <strong>Select guests</strong>
              </div>
              <div class="space-y-4">
                <div v-for="type in paxTypes" :key="type" class="pax-row">
                  <div>
                    <strong>{{ type }}</strong>
                    <small>{{ labels[type] }} · max {{ limit[type] }}</small>
                  </div>
                  <div class="stepper">
                    <button :aria-label="`Remove ${type}`" @click="dec(type)"><Minus :size="15" /></button>
                    <span>{{ counts[type] }}</span>
                    <button :aria-label="`Add ${type}`" :disabled="counts[type] >= limit[type]" @click="inc(type)"><Plus :size="15" /></button>
                  </div>
                </div>
              </div>
            </div>

            <div class="step">
              <div class="step-head">
                <span>3</span>
                <strong>Guest details</strong>
              </div>
              <label>
                <span>Full name</span>
                <input v-model.trim="form.name" autocomplete="name" placeholder="Alex Morgan" />
              </label>
              <label>
                <span>Email address</span>
                <input v-model.trim="form.email" autocomplete="email" inputmode="email" placeholder="alex@example.com" />
              </label>
            </div>

            <div v-if="err" class="state bad">{{ err }}</div>
            <div v-if="ok" class="state good">
              <Check :size="17" />
              Booked. Confirmation {{ ok.booking.id }} is ready.
            </div>

            <div class="summary">
              <div v-for="type in paxTypes.filter(t => counts[t] > 0)" :key="type">
                <span>{{ counts[type] }} × {{ type }}</span>
                <strong>{{ money(counts[type] * price) }}</strong>
              </div>
              <div class="total">
                <span>Total</span>
                <strong>{{ money(total) }}</strong>
              </div>
            </div>

            <button class="primary w-full" :disabled="!canBook" @click="book">
              <LockKeyhole v-if="!busy" :size="17" />
              <RefreshCw v-else class="spin" :size="17" />
              {{ busy ? 'Reserving' : `Reserve ${money(total)}` }}
            </button>
            <p class="secure"><Mail :size="14" /> Secure booking. No payment taken here.</p>
          </template>
        </div>
      </aside>
    </section>
  </main>
</template>
