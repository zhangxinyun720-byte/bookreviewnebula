<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { siteText } from '@/config/site'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const errorMsg = ref('')

async function handleSubmit() {
  errorMsg.value = ''
  try {
    await auth.signIn(email.value, password.value)
    const redirect = route.query.redirect
    router.push(typeof redirect === 'string' ? redirect : '/admin')
  } catch (e) {
    errorMsg.value = siteText.login.error
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-head">
        <span class="brand-mark">{{ siteText.site.brandMark }}</span>
        <h1 class="serif">{{ siteText.login.title }}</h1>
        <p class="muted">{{ siteText.login.subtitle }}</p>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="field">
          <label for="email">{{ siteText.login.email }}</label>
          <input
            id="email"
            v-model="email"
            type="email"
            :placeholder="siteText.login.emailPlaceholder"
            autocomplete="email"
            required
          />
        </div>
        <div class="field">
          <label for="password">{{ siteText.login.password }}</label>
          <input
            id="password"
            v-model="password"
            type="password"
            :placeholder="siteText.login.passwordPlaceholder"
            autocomplete="current-password"
            required
          />
        </div>
        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
        <button type="submit" class="btn btn--primary" :disabled="auth.loading" style="width:100%; justify-content:center;">
          {{ auth.loading ? siteText.login.buttonLoading : siteText.login.button }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: grid;
  place-items: center;
  min-height: calc(100vh - 64px - 112px);
  padding: 20px 0;
}
.login-card {
  width: 100%;
  max-width: 380px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 40px 32px;
}
.login-head { text-align: center; margin-bottom: 28px; }
.brand-mark {
  display: inline-grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--text);
  color: var(--bg);
  font-family: var(--font-serif);
  font-size: 1.3rem;
  margin-bottom: 14px;
}
.login-head h1 { font-size: 1.4rem; font-weight: 600; margin-bottom: 6px; }
.login-head p { font-size: 0.86rem; }
.error {
  color: var(--danger);
  font-size: 0.84rem;
  margin-bottom: 14px;
  text-align: center;
}
</style>
