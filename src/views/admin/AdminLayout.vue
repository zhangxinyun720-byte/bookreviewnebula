<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { siteText } from '@/config/site'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

function isActive(name) {
  return route.name === name || route.path.startsWith(`/admin/${name}`)
}
</script>

<template>
  <div class="admin container container--wide">
    <aside class="sidebar">
      <h2 class="sidebar-title">{{ siteText.admin.layout.title }}</h2>
      <nav class="side-nav">
        <router-link to="/admin" class="side-link" :class="{ active: isActive('admin-books') || route.name === 'admin-book-new' || route.name === 'admin-book-edit' }">
          {{ siteText.admin.layout.books }}
        </router-link>
        <router-link to="/admin/categories" class="side-link" :class="{ active: isActive('categories') }">
          {{ siteText.admin.layout.categories }}
        </router-link>
      </nav>
      <router-link to="/" class="side-link side-link--muted">{{ siteText.admin.layout.backToSite }}</router-link>
      <button class="side-link side-link--muted" @click="auth.signOut().then(() => router.push('/'))">{{ siteText.admin.layout.logout }}</button>
    </aside>

    <main class="admin-main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.admin {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 32px;
  align-items: start;
}
.sidebar {
  position: sticky;
  top: 88px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.sidebar-title {
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-mute);
  margin-bottom: 14px;
  padding-left: 12px;
}
.side-link {
  display: block;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--text-soft);
  text-align: left;
  transition: all var(--transition);
}
.side-link:hover { background: var(--surface-2); color: var(--text); }
.side-link.active { background: var(--text); color: var(--bg); }
.side-link--muted { color: var(--text-mute); font-size: 0.84rem; margin-top: 8px; }
.admin-main { min-width: 0; }

@media (max-width: 720px) {
  .admin { grid-template-columns: 1fr; }
  .sidebar { position: static; flex-direction: row; flex-wrap: wrap; }
  .sidebar-title { width: 100%; }
  .side-link { display: inline-block; }
}
</style>
