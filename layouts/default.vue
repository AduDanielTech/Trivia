<template>
  <div class="app-shell" :class="colorMode.value">
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <!-- ARIA live regions -->
    <div aria-live="polite" aria-atomic="true" class="sr-only" role="status">{{ announcer.politeMsg.value }}</div>
    <div aria-live="assertive" aria-atomic="true" class="sr-only" role="alert">{{ announcer.assertiveMsg.value }}</div>
    <div aria-live="polite" aria-atomic="true" class="sr-only" role="status">{{ userStore.liveAnnouncement }}</div>

    <!-- Header -->
    <header class="site-header" role="banner">
      <nav class="nav-inner" aria-label="Main navigation">

        <!-- Logo -->
        <NuxtLink to="/" class="logo" aria-label="TRIVIA home">
          <span class="logo-hex" aria-hidden="true">⬡</span>
          <span class="logo-text">TRIVIA</span>
          <span class="logo-sub">by Litesigma</span>
        </NuxtLink>

        <!-- Desktop links -->
        <ul class="nav-links" role="list">
          <li v-for="link in navLinks" :key="link.to">
            <NuxtLink
              :to="link.to"
              class="nav-link"
              :class="{ active: route.path === link.to || (link.to !== '/' && route.path.startsWith(link.to)) }"
              :aria-current="route.path === link.to ? 'page' : undefined"
            >{{ link.label }}</NuxtLink>
          </li>
        </ul>

        <!-- Right controls -->
        <div class="nav-controls">

          <!-- Theme toggle -->
          <button
            class="icon-btn"
            @click="toggleColorMode"
            :aria-label="`Switch to ${colorMode.value === 'dark' ? 'light' : 'dark'} mode`"
          >
            <Transition name="icon-swap" mode="out-in">
              <span v-if="colorMode.value === 'dark'" key="sun">☀️</span>
              <span v-else key="moon">🌙</span>
            </Transition>
          </button>

          <!-- Sound -->
          <button
            class="icon-btn"
            :aria-label="sound.isEnabled.value ? 'Mute sound' : 'Enable sound'"
            :aria-pressed="sound.isEnabled.value"
            @click="sound.toggle"
          >
            <span aria-hidden="true">{{ sound.isEnabled.value ? '🔊' : '🔇' }}</span>
          </button>

          <template v-if="isAuthed">
          <!-- Streak chip -->
          <div
            class="chip streak-chip"
            :class="{ 'at-risk': userStore.streakAtRisk }"
            role="status"
          >
            <span aria-hidden="true">🔥</span>
            <span class="chip-val">{{ userStore.streak }}</span>
          </div>

          <!-- XP chip -->
          <div class="chip xp-chip hidden sm:flex" role="status">
            <span aria-hidden="true">{{ userStore.currentTier.icon }}</span>
            <span class="chip-val font-mono">{{ userStore.xp.toLocaleString() }}</span>
          </div>

          <!-- Avatar dropdown -->
          <div class="avatar-wrap" ref="avatarWrap">
            <button
              class="avatar-btn"
              :aria-label="`Open menu for ${authStore.userName}`"
              @click="menuOpen = !menuOpen"
            >
              <span class="avatar-inner">{{ userStore.avatar || '?' }}</span>
            </button>

            <Transition name="dropdown">
              <div v-if="menuOpen" class="dropdown-menu" role="menu">
                <div class="dropdown-header">
                  <p class="dropdown-name">{{ authStore.userName }}</p>
                  <p class="dropdown-email">{{ authStore.userEmail }}</p>
                </div>
                <div class="dropdown-body">
                  <NuxtLink
                    v-for="item in menuItems"
                    :key="item.to"
                    :to="item.to"
                    class="dropdown-item"
                    role="menuitem"
                    @click="menuOpen = false"
                  >
                    <span aria-hidden="true">{{ item.icon }}</span>{{ item.label }}
                  </NuxtLink>
                  <div class="dropdown-divider" />
                  <button class="dropdown-item danger" role="menuitem" @click="handleSignOut">
                    <span aria-hidden="true">↩</span> Sign Out
                  </button>
                </div>
              </div>
            </Transition>
          </div>
          </template>

          <template v-else>
            <NuxtLink to="/auth/login" class="auth-link">Sign in</NuxtLink>
            <NuxtLink to="/auth/signup" class="auth-btn">Get started</NuxtLink>
          </template>
        </div>
      </nav>
    </header>

    <!-- Main -->
    <main id="main-content" class="site-main" tabindex="-1">
      <slot />
    </main>

    <!-- Mobile nav -->
    <nav
      class="mobile-nav"
      aria-label="Mobile navigation"
    >
      <NuxtLink
        v-for="link in mobileLinksView"
        :key="link.to"
        :to="link.to"
        class="mobile-link"
        :class="{ active: route.path === link.to }"
      >
        <span class="mobile-icon" aria-hidden="true">{{ link.icon }}</span>
        <span class="mobile-label">{{ link.label }}</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
	const route = useRoute()
	const userStore = useUserStore()
	const authStore = useAuthStore()
	const supabaseUser = useSupabaseUser()
	const sound = useSound()
	const announcer = useAnnouncer()
	const menuOpen = ref(false)
	const avatarWrap = ref<HTMLElement | null>(null)

	const isAuthed = computed(() => !!supabaseUser.value || authStore.isAuthenticated)

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

	const navLinks = computed(() => {
	  if (!isAuthed.value) {
	    return [
	      { to: '/', label: 'Home' },
	      { to: '/quiz', label: 'Practice' },
	      { to: '/leaderboard', label: 'Ranks' },
	    ]
	  }
	  return [
	    { to: '/dashboard', label: 'Dashboard' },
	    { to: '/quiz', label: 'Practice' },
	    { to: '/upload', label: 'Study AI' },
	    { to: '/leaderboard', label: 'Ranks' },
	  ]
	})

const mobileLinks = [
  { to: '/dashboard', label: 'Home', icon: '🏠' },
  { to: '/quiz', label: 'Quiz', icon: '🎯' },
  { to: '/upload', label: 'Upload', icon: '📄' },
  { to: '/leaderboard', label: 'Ranks', icon: '🏆' },
]

const mobileLinksView = computed(() => {
  if (isAuthed.value) return mobileLinks
  return [
    { to: '/', label: 'Home', icon: '🏠' },
    { to: '/quiz', label: 'Quiz', icon: '🎯' },
    { to: '/leaderboard', label: 'Ranks', icon: '🏆' },
  ]
})

const menuItems = [
  { to: '/progress', icon: '📊', label: 'My Progress' },
  { to: '/upload', icon: '📄', label: 'Upload Docs' },
]

onMounted(() => {
  document.addEventListener('click', (e) => {
    if (avatarWrap.value && !avatarWrap.value.contains(e.target as Node)) {
      menuOpen.value = false
    }
  })
})

const handleSignOut = async () => {
  menuOpen.value = false
  await authStore.signOut()
}
</script>

<style scoped>
/* ─── Design tokens ─────────────────────────────────── */
.app-shell {
  /* Primary action color (Educational Green) */
  --primary: #16a34a;
  --primary-dim: rgba(22,163,74,0.12);
  --primary-glow: rgba(22,163,74,0.25);

  --gold: #F5C518;
  --gold-dim: rgba(245,197,24,0.12);
  --gold-glow: rgba(245,197,24,0.25);

  /* Light mode */
  --bg: #FAF9F6;          /* paper-50 */
  --surface: #FFFFFF;     /* clean surface */
  --surface-2: #F2F0E9;   /* paper-100 */
  --border: #E5E2D9;      /* paper-200 */
  --text: #2C2E2A;        /* paper-800 */
  --text-2: #3C3E39;
  --text-3: #717D6E;      /* sage */
  --nav-bg: rgba(250,249,246,0.88);
  --chip-bg: #F2F0E9;
  --chip-text: #2C2E2A;
  --shadow: 0 2px 20px rgba(0,0,0,0.07);
  --shadow-lg: 0 8px 40px rgba(0,0,0,0.1);

  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: 'Public Sans', Inter, system-ui, sans-serif;
  transition: background 0.3s, color 0.3s;
}

/* Dark mode tokens */
.app-shell.dark {
  --bg: #070A12;          /* ink-950 */
  --surface: #0B1020;     /* ink-900 */
  --surface-2: #0F1730;   /* ink-800 */
  --border: rgba(255,255,255,0.10);
  --text: #FAF9F6;        /* paper-50 */
  --text-2: rgba(250,249,246,0.82);
  --text-3: rgba(250,249,246,0.62);
  --nav-bg: rgba(7,10,18,0.78);
  --chip-bg: rgba(255,255,255,0.06);
  --chip-text: rgba(250,249,246,0.86);
  --shadow: 0 2px 20px rgba(0,0,0,0.4);
  --shadow-lg: 0 8px 40px rgba(0,0,0,0.6);
}

/* ─── Skip link ─────────────────────────────────────── */
.skip-link {
  position: absolute;
  top: -9999px;
  left: 1rem;
  z-index: 999;
  background: var(--primary);
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 13px;
  text-decoration: none;
}
.skip-link:focus { top: 0.75rem; }

/* ─── Header ─────────────────────────────────────────── */
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--nav-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow);
  transition: background 0.3s, border-color 0.3s;
}

.nav-inner {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 60px;
  display: flex;
  align-items: center;
  gap: 2rem;
}

/* ─── Logo ───────────────────────────────────────────── */
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  flex-shrink: 0;
}
.logo-hex {
  color: var(--primary);
  font-size: 22px;
  filter: drop-shadow(0 0 6px var(--primary-glow));
}
.logo-text {
  font-size: 17px;
  font-weight: 900;
  letter-spacing: -0.03em;
  color: var(--text);
}
.logo-sub {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-3);
  font-weight: 700;
  display: none;
}
@media (min-width: 640px) { .logo-sub { display: block; } }

/* ─── Nav links ──────────────────────────────────────── */
.nav-links {
  display: none;
  align-items: center;
  gap: 2px;
  list-style: none;
  margin: 0;
  padding: 0;
  margin-left: auto;
}
@media (min-width: 768px) { .nav-links { display: flex; } }

.nav-link {
  display: block;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  color: var(--text-2);
  transition: color 0.15s, background 0.15s;
}
.nav-link:hover {
  color: var(--text);
  background: var(--surface-2);
}
.nav-link.active {
  color: var(--primary);
  background: var(--primary-dim);
}

/* ─── Controls ───────────────────────────────────────── */
.nav-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}
@media (min-width: 768px) { .nav-controls { margin-left: 0; } }

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  border: 1px solid var(--border);
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, transform 0.1s;
  color: var(--text-2);
}
.icon-btn:hover {
  border-color: var(--primary);
  transform: translateY(-1px);
}

/* Logged-out auth actions (placeholders for backend-only identity) */
.auth-link {
  padding: 8px 10px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
  color: var(--text-2);
}
.auth-link:hover { color: var(--text); background: var(--surface-2); }

.auth-btn {
  padding: 9px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 900;
  text-decoration: none;
  color: #fff;
  background: var(--primary);
  border: 1px solid rgba(22,163,74,0.25);
  box-shadow: var(--shadow);
}
.auth-btn:hover { filter: brightness(1.03); transform: translateY(-1px); }

.chip {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 999px;
  background: var(--chip-bg);
  border: 1px solid var(--border);
  font-size: 12px;
  font-weight: 700;
  color: var(--chip-text);
}
.chip-val { font-variant-numeric: tabular-nums; }

.streak-chip { color: #F5C518; border-color: rgba(245,197,24,0.2); background: rgba(245,197,24,0.08); }
.streak-chip.at-risk { color: #FF4F6D; border-color: rgba(255,79,109,0.25); background: rgba(255,79,109,0.08); animation: pulse 1.5s infinite; }

/* ─── Avatar ─────────────────────────────────────────── */
.avatar-wrap { position: relative; }

.avatar-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  padding: 2px;
  border: 2px solid transparent;
  background: transparent;
  cursor: pointer;
  transition: border-color 0.15s;
}
.avatar-btn:hover { border-color: var(--primary); }

.avatar-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5C518, #FF9F43);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 900;
  color: #0D1117;
}

/* ─── Dropdown ───────────────────────────────────────── */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 240px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 200;
}
.dropdown-header {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--surface-2);
}
.dropdown-name {
  font-size: 13px;
  font-weight: 800;
  color: var(--text);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dropdown-email {
  font-size: 11px;
  color: var(--text-3);
  margin: 2px 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dropdown-body { padding: 6px; }
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-2);
  text-decoration: none;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
  text-align: left;
}
.dropdown-item:hover {
  background: var(--primary-dim);
  color: var(--primary);
}
.dropdown-item.danger { color: #FF4F6D; }
.dropdown-item.danger:hover { background: rgba(255,79,109,0.08); color: #FF4F6D; }
.dropdown-divider { height: 1px; background: var(--border); margin: 4px 0; }

/* ─── Main & Mobile nav ──────────────────────────────── */
.site-main { flex: 1; outline: none; padding-bottom: 80px; }
@media (min-width: 768px) { .site-main { padding-bottom: 0; } }

.mobile-nav {
  display: flex;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--nav-bg);
  backdrop-filter: blur(16px);
  border-top: 1px solid var(--border);
  justify-content: space-around;
  padding: 8px 0 max(12px, env(safe-area-inset-bottom));
}
@media (min-width: 768px) { .mobile-nav { display: none; } }

.mobile-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  text-decoration: none;
  color: var(--text-3);
  transition: color 0.15s;
  padding: 0 16px;
}
.mobile-link.active { color: var(--primary); }
.mobile-icon { font-size: 20px; line-height: 1; }
.mobile-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; }

/* ─── Transitions ────────────────────────────────────── */
.dropdown-enter-active, .dropdown-leave-active {
  transition: opacity 0.18s ease, transform 0.18s cubic-bezier(0.4,0,0.2,1);
  transform-origin: top right;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-6px);
}

.icon-swap-enter-active, .icon-swap-leave-active { transition: opacity 0.15s, transform 0.15s; }
.icon-swap-enter-from { opacity: 0; transform: rotate(-30deg) scale(0.7); }
.icon-swap-leave-to { opacity: 0; transform: rotate(30deg) scale(0.7); }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
</style>
