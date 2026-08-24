<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { siteText } from '@/config/site'

const auth = useAuthStore()
const menuOpen = ref(false)

function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <header class="site-header">
    <div class="container container--wide header-inner">
      <router-link to="/" class="brand" @click="closeMenu">
        <span class="brand-mark">{{ siteText.site.brandMark }}</span>
        <span class="brand-text">{{ siteText.site.brandName }}</span>
      </router-link>

      <button class="menu-toggle" :class="{ active: menuOpen }" @click="menuOpen = !menuOpen" :aria-label="siteText.nav.menuLabel">
        <span></span><span></span>
      </button>

      <nav class="nav" :class="{ open: menuOpen }">
        <router-link to="/" class="nav-link" @click="closeMenu">{{ siteText.nav.home }}</router-link>
        <router-link v-if="auth.isAuthenticated" to="/admin" class="nav-link" @click="closeMenu">{{ siteText.nav.admin }}</router-link>
        <router-link v-if="!auth.isAuthenticated" to="/login" class="nav-link" @click="closeMenu">{{ siteText.nav.login }}</router-link>
        <button v-else class="nav-link nav-btn" @click="auth.signOut(); closeMenu()">{{ siteText.nav.logout }}</button>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(253, 242, 248, 0.86);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}
.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}
.brand-mark {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--text);
  color: var(--bg);
  font-family: var(--font-serif);
  font-size: 1.05rem;
}
.brand-text {
  letter-spacing: 0.02em;
  font-size: 0.98rem;
}
.nav {
  display: flex;
  align-items: center;
  gap: 6px;
}
.nav-link {
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--text-soft);
  transition: all var(--transition);
}
.nav-link:hover { color: var(--text); background: var(--surface-2); }
.nav-link.router-link-active { color: var(--accent); }
.nav-btn { cursor: pointer; border: none; background: none; font-size: 0.9rem; }

.menu-toggle { display: none; }

@media (max-width: 640px) {
  .menu-toggle {
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 8px;
  }
  .menu-toggle span {
    width: 20px;
    height: 2px;
    background: var(--text);
    border-radius: 2px;
    transition: all var(--transition);
  }
  .menu-toggle.active span:first-child { transform: translateY(7px) rotate(45deg); }
  .menu-toggle.active span:last-child { transform: translateY(-5px) rotate(-45deg); }
  .nav {
    position: absolute;
    top: 64px;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 8px 18px 16px;
    gap: 2px;
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
    transition: all var(--transition);
  }
  .nav.open { transform: translateY(0); opacity: 1; pointer-events: auto; }
}
</style>
