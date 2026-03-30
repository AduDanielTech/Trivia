<template>
  <div class="min-h-screen bg-navy-900 pb-24 md:pb-12">
    <div class="max-w-[640px] mx-auto px-6 py-8 flex flex-col gap-6">

      <header class="animate-fade-in">
        <h1 class="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-white mb-1">
          <span aria-hidden="true">⚙️</span> Settings
        </h1>
        <p class="text-sm text-navy-400">Manage your profile and preferences</p>
      </header>

      <!-- Profile -->
      <section class="bg-navy-700 border border-navy-500 rounded-2xl p-6 animate-fade-in" style="animation-delay:100ms" aria-labelledby="profile-heading">
        <h2 id="profile-heading" class="text-xs font-bold uppercase tracking-widest text-navy-400 mb-5">Profile</h2>

        <div class="flex flex-col gap-4">
          <!-- Avatar -->
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-white text-xl font-bold flex-shrink-0" aria-hidden="true">
              {{ userStore.avatar || '?' }}
            </div>
            <div>
              <div class="text-sm font-semibold text-white">{{ userStore.displayName }}</div>
              <div class="text-xs text-navy-400">{{ userStore.email }}</div>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <div>
              <label for="full_name" class="block text-[11px] font-bold uppercase tracking-widest text-navy-400 mb-1.5">Full Name</label>
              <input id="full_name" v-model="form.full_name" type="text" placeholder="Your full name"
                class="w-full bg-navy-600 border border-navy-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-navy-400 focus:outline-none focus:border-yellow-600 transition-colors" />
            </div>
            <div>
              <label for="username" class="block text-[11px] font-bold uppercase tracking-widest text-navy-400 mb-1.5">Username</label>
              <input id="username" v-model="form.username" type="text" placeholder="your_username"
                class="w-full bg-navy-600 border border-navy-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-navy-400 focus:outline-none focus:border-yellow-600 transition-colors" />
            </div>
          </div>

          <button
            class="self-start px-5 py-2.5 rounded-lg bg-gold-500 text-navy-900 text-sm font-bold hover:bg-gold-400 transition-all duration-200 disabled:opacity-50"
            :disabled="savingProfile"
            @click="saveProfile"
          >
            {{ savingProfile ? 'Saving…' : 'Save Profile' }}
          </button>
          <p v-if="profileSuccess" class="text-xs text-green-400" role="status">{{ profileSuccess }}</p>
          <p v-if="profileError"   class="text-xs text-red-400"   role="alert">{{ profileError }}</p>
        </div>
      </section>

      <!-- Sound & Audio -->
      <section class="bg-navy-700 border border-navy-500 rounded-2xl p-6 animate-fade-in" style="animation-delay:200ms" aria-labelledby="sound-heading">
        <h2 id="sound-heading" class="text-xs font-bold uppercase tracking-widest text-navy-400 mb-5">Sound & Audio</h2>

        <div class="flex flex-col gap-4">
          <!-- Sound toggle -->
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm font-semibold text-white">Sound Effects</div>
              <div class="text-[11px] text-navy-400">Play sounds on correct / incorrect answers</div>
            </div>
            <button
              class="relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 cursor-pointer border-0"
              :class="form.sound_enabled ? 'bg-green-600' : 'bg-navy-500'"
              :aria-pressed="form.sound_enabled"
              :aria-label="form.sound_enabled ? 'Sound on. Tap to mute.' : 'Sound off. Tap to enable.'"
              @click="form.sound_enabled = !form.sound_enabled; savePreferences()"
            >
              <span class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200"
                :class="form.sound_enabled ? 'left-7' : 'left-1'" aria-hidden="true" />
            </button>
          </div>

          <!-- Audio mode -->
          <div>
            <div class="text-sm font-semibold text-white mb-2">Audio Mode</div>
            <div class="flex gap-2" role="group" aria-label="Audio mode">
              <button v-for="opt in audioModes" :key="opt.value"
                class="flex-1 py-2.5 rounded-lg border text-xs font-bold transition-all duration-150 cursor-pointer"
                :class="form.audio_mode === opt.value
                  ? 'bg-gold-500/[0.08] border-yellow-600 text-yellow-500'
                  : 'bg-navy-600 border-navy-500 text-navy-400 hover:border-navy-400'"
                :aria-pressed="form.audio_mode === opt.value"
                @click="form.audio_mode = opt.value; savePreferences()"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Privacy -->
      <section class="bg-navy-700 border border-navy-500 rounded-2xl p-6 animate-fade-in" style="animation-delay:300ms" aria-labelledby="privacy-heading">
        <h2 id="privacy-heading" class="text-xs font-bold uppercase tracking-widest text-navy-400 mb-5">Privacy</h2>

        <div class="flex flex-col gap-4">
          <div v-for="toggle in privacyToggles" :key="toggle.key" class="flex items-center justify-between">
            <div>
              <div class="text-sm font-semibold text-white">{{ toggle.label }}</div>
              <div class="text-[11px] text-navy-400">{{ toggle.description }}</div>
            </div>
            <button
              class="relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 cursor-pointer border-0"
              :class="(form as any)[toggle.key] ? 'bg-green-600' : 'bg-navy-500'"
              :aria-pressed="(form as any)[toggle.key]"
              :aria-label="`${toggle.label}: ${(form as any)[toggle.key] ? 'on' : 'off'}`"
              @click="(form as any)[toggle.key] = !(form as any)[toggle.key]; savePreferences()"
            >
              <span class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200"
                :class="(form as any)[toggle.key] ? 'left-7' : 'left-1'" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      <!-- Study field -->
      <section class="bg-navy-700 border border-navy-500 rounded-2xl p-6 animate-fade-in" style="animation-delay:400ms" aria-labelledby="field-heading">
        <h2 id="field-heading" class="text-xs font-bold uppercase tracking-widest text-navy-400 mb-5">Study Field</h2>
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm font-semibold text-white">{{ userStore.currentSubject?.toUpperCase() || 'Not set' }}</div>
            <div class="text-[11px] text-navy-400">{{ userStore.currentField || 'No field selected' }}</div>
          </div>
          <NuxtLink to="/fields"
            class="px-4 py-2 rounded-lg border border-navy-400 text-navy-400 text-xs font-semibold no-underline hover:bg-navy-600 hover:text-white transition-all duration-150">
            Change Field
          </NuxtLink>
        </div>
      </section>

      <!-- Account -->
      <section class="bg-navy-700 border border-red-500/20 rounded-2xl p-6 animate-fade-in" style="animation-delay:500ms" aria-labelledby="account-heading">
        <h2 id="account-heading" class="text-xs font-bold uppercase tracking-widest text-navy-400 mb-5">Account</h2>
        <div class="flex flex-col gap-3">
          <button
            class="self-start px-5 py-2.5 rounded-lg border border-navy-500 text-navy-400 text-sm font-semibold hover:bg-navy-600 hover:text-white transition-all duration-200 cursor-pointer bg-transparent"
            @click="authStore.signOut()"
          >
            Sign Out
          </button>
          <p class="text-[11px] text-navy-500">
            To delete your account, contact support.
          </p>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore'
import { useUserStore  } from '~/stores/userStore'

definePageMeta({ layout: 'default' })
useHead({ title: 'Settings — TRIVIA' })

const authStore = useAuthStore()
const userStore = useUserStore()

// Form state — pre-filled from store
const form = reactive({
  full_name:          userStore.full_name    || '',
  username:           userStore.username     || '',
  sound_enabled:      userStore.soundEnabled,
  audio_mode:         userStore.audioMode    as string,
  leaderboard_visible: userStore.leaderboardVisible,
  community_visible:  userStore.communityVisible,
})

const savingProfile  = ref(false)
const profileSuccess = ref('')
const profileError   = ref('')

const audioModes = [
  { value: 'effects', label: '🔊 Effects' },
  { value: 'tts',     label: '🗣️ TTS'     },
  { value: 'off',     label: '🔇 Off'      },
]

const privacyToggles = [
  { key: 'leaderboard_visible', label: 'Appear on Leaderboard', description: 'Your username shows in global rankings' },
  { key: 'community_visible',   label: 'Community Visibility',  description: 'Others can see your progress in community stats' },
]

async function saveProfile() {
  savingProfile.value  = true
  profileSuccess.value = ''
  profileError.value   = ''
  try {
    await userStore.updateSettings({
      full_name: form.full_name,
      username:  form.username,
    })
    profileSuccess.value = 'Profile updated successfully.'
  } catch {
    profileError.value = 'Failed to save profile. Please try again.'
  } finally {
    savingProfile.value = false
  }
}

// Debounced preferences save (toggles save immediately)
let prefTimer: ReturnType<typeof setTimeout>
async function savePreferences() {
  clearTimeout(prefTimer)
  prefTimer = setTimeout(async () => {
    try {
      await userStore.updateSettings({
        sound_enabled:      form.sound_enabled,
        audio_mode:         form.audio_mode,
        leaderboard_visible: form.leaderboard_visible,
        community_visible:  form.community_visible,
      })
    } catch {
      // Silent — preferences are low priority
    }
  }, 500)
}
</script>
