<template>
  <div class="min-h-screen flex flex-col bg-navy-900">
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <!-- ARIA live regions -->
    <div aria-live="polite" aria-atomic="true" class="sr-only" role="status">{{ announcer.politeMsg.value }}</div>
    <div aria-live="assertive" aria-atomic="true" class="sr-only" role="alert">{{ announcer.assertiveMsg.value }}</div>
    <div aria-live="polite" aria-atomic="true" class="sr-only" role="status">{{ userStore.liveAnnouncement }}</div>

    <!-- Nav -->
    <header class="sticky top-0 z-50 bg-navy-900/92 backdrop-blur-md border-b border-navy-600" role="banner">
      <nav class="max-w-[1280px] mx-auto px-6 h-[60px] flex items-center gap-8" aria-label="Main navigation">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 no-underline flex-shrink-0" aria-label="TRIVIA home">
          <span class="text-gold-500 text-2xl" aria-hidden="true">⬡</span>
          <span class="text-lg font-extrabold text-white tracking-tight">TRIVIA</span>
          <span class="text-[10px] text-navy-400 uppercase tracking-widest hidden sm:block">by Litesigma</span>
        </NuxtLink>

        <!-- Desktop links -->
        <ul class="hidden md:flex items-center gap-1 ml-auto list-none" role="list">
          <li v-for="link in navLinks" :key="link.to">
            <NuxtLink :to="link.to"
              class="px-3.5 py-1.5 rounded-lg text-[13px] font-medium no-underline transition-all duration-200"
              :class="route.path === link.to || (link.to !== '/' && route.path.startsWith(link.to))
                ? 'text-gold-500 bg-navy-600'
                : 'text-navy-400 hover:text-white hover:bg-navy-600'"
              :aria-current="route.path === link.to ? 'page' : undefined"
            >{{ link.label }}</NuxtLink>
          </li>
        </ul>

        <!-- Right controls -->
        <div class="flex items-center gap-3 ml-auto md:ml-0">
          <!-- Sound -->
          <button class="w-9 h-9 rounded-lg border border-navy-500 bg-transparent flex items-center justify-center text-base text-navy-400 hover:bg-navy-600 hover:text-white transition-all duration-200"
            :aria-label="sound.isEnabled.value ? 'Mute sound effects' : 'Enable sound effects'"
            :aria-pressed="sound.isEnabled.value"
            @click="sound.toggle">
            <span aria-hidden="true">{{ sound.isEnabled.value ? '🔊' : '🔇' }}</span>
          </button>

          <!-- Streak -->
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all"
            :class="userStore.streakAtRisk
              ? 'bg-red-500/10 border-red-500/30 text-red-500 animate-pulse-gold'
              : 'bg-gold-500/10 border-gold-500/25 text-gold-500'"
            role="status"
            :aria-label="`${userStore.streak}-day streak${userStore.streakAtRisk ? '. At risk today.' : ''}`">
            <span aria-hidden="true" class="text-sm animate-flame">🔥</span>
            <span class="font-mono text-sm font-bold">{{ userStore.streak }}</span>
          </div>

          <!-- XP -->
          <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-navy-700 border border-navy-500 text-sm font-bold text-white"
            role="status" :aria-label="`${userStore.xp} XP. Tier: ${userStore.currentTier.name}`">
            <span aria-hidden="true" class="text-sm">{{ userStore.currentTier.icon }}</span>
            <span class="font-mono">{{ userStore.xp.toLocaleString() }}</span>
            <span class="font-mono text-[10px] text-navy-400 uppercase tracking-widest">XP</span>
          </div>

          <!-- Avatar dropdown -->
          <div class="relative" ref="avatarWrap">
            <button class="p-0.5 rounded-full border-0 bg-transparent cursor-pointer"
              :aria-label="`Open menu for ${authStore.userName}`"
              aria-haspopup="true" :aria-expanded="menuOpen"
              @click="menuOpen = !menuOpen" @keydown.escape="menuOpen = false">
              <div class="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-white text-xs font-bold tracking-wide">
                {{ userStore.avatar || '?' }}
              </div>
            </button>

            <Transition name="dropdown">
              <div v-if="menuOpen"
                class="absolute top-[calc(100%+8px)] right-0 w-56 bg-navy-700 border border-navy-500 rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] overflow-hidden z-50"
                role="menu" aria-label="User menu" @keydown.escape="menuOpen = false">
                <div class="px-4 py-3 border-b border-navy-600">
                  <p class="text-sm font-bold text-white truncate">{{ authStore.userName }}</p>
                  <p class="text-xs text-navy-400 mt-0.5 truncate">{{ authStore.userEmail }}</p>
                </div>
                <div class="p-1.5">
                  <NuxtLink v-for="item in menuItems" :key="item.to" :to="item.to"
                    class="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[13px] font-medium text-navy-400 no-underline hover:bg-navy-600 hover:text-white transition-all duration-150"
                    role="menuitem" @click="menuOpen = false">
                    <span aria-hidden="true">{{ item.icon }}</span>{{ item.label }}
                  </NuxtLink>
                  <hr class="border-t border-navy-600 my-1" />
                  <button
                    class="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[13px] font-medium text-red-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150 text-left border-0 bg-transparent cursor-pointer"
                    role="menuitem" :aria-busy="authStore.loading" @click="handleSignOut">
                    <span aria-hidden="true">↩</span>
                    {{ authStore.loading ? 'Signing out…' : 'Sign Out' }}
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </nav>
    </header>

    <main id="main-content" class="flex-1 pb-0 outline-none" tabindex="-1">
      <slot />
    </main>

    <!-- Mobile nav -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-navy-800 border-t border-navy-600 flex justify-around py-2 pb-safe"
      aria-label="Mobile navigation">
      <NuxtLink v-for="link in mobileLinks" :key="link.to" :to="link.to"
        class="flex flex-col items-center gap-0.5 px-3 py-1 no-underline transition-colors"
        :class="route.path === link.to || (link.to !== '/' && route.path.startsWith(link.to))
          ? 'text-gold-500' : 'text-navy-400'"
        :aria-label="link.label">
        <span aria-hidden="true" class="text-lg">{{ link.icon }}</span>
        <span class="text-[10px] font-semibold uppercase tracking-wide">{{ link.label }}</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/index'
import { useAuthStore } from '~/stores/auth'

const route     = useRoute()
const userStore = useUserStore()
const authStore = useAuthStore()
const sound     = useSound()
const announcer = useAnnouncer()
const menuOpen  = ref(false)
const avatarWrap = ref<HTMLElement | null>(null)

const navLinks = [
  { to: '/',           label: 'Dashboard' },
  { to: '/quiz',       label: 'Practice'  },
  { to: '/upload',     label: 'Upload'    },
  { to: '/progress',   label: 'Progress'  },
  { to: '/leaderboard',label: 'Ranks'     },
]

const mobileLinks = [
  { to: '/',            label: 'Home',     icon: '⊞' },
  { to: '/quiz',        label: 'Practice', icon: '◈' },
  { to: '/upload',      label: 'Upload',   icon: '↑' },
  { to: '/leaderboard', label: 'Ranks',    icon: '▲' },
]

const menuItems = [
  { to: '/progress', icon: '📊', label: 'Progress'     },
  { to: '/upload',   icon: '📄', label: 'Upload Docs'  },
]

onMounted(() => {
  document.addEventListener('click', (e) => {
    if (avatarWrap.value && !avatarWrap.value.contains(e.target as Node)) menuOpen.value = false
  })
})

const handleSignOut = async () => {
  menuOpen.value = false
  await authStore.signOut()
}
</script>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.15s cubic-bezier(0.4,0,0.2,1);
  transform-origin: top right;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}
.pb-safe { padding-bottom: max(8px, env(safe-area-inset-bottom)); }
</style>
