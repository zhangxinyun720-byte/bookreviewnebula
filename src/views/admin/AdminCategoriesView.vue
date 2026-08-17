<script setup>
import { ref, onMounted } from 'vue'
import { useCategoriesStore } from '@/stores/categories'
import { useBooksStore } from '@/stores/books'
import { siteText } from '@/config/site'

const categories = useCategoriesStore()
const books = useBooksStore()

const editing = ref(false)
const editingId = ref(null)
const form = ref({ name: '', slug: '', description: '', sort_order: 0 })
const error = ref('')

onMounted(() => {
  categories.fetchAll()
  books.fetchAllAdmin()
})

function bookCount(catId) {
  return books.items.filter((b) => b.categories?.some((c) => c.id === catId)).length
}

function startCreate() {
  editing.value = true
  editingId.value = null
  form.value = { name: '', slug: '', description: '', sort_order: categories.count }
}

function startEdit(cat) {
  editing.value = true
  editingId.value = cat.id
  form.value = {
    name: cat.name,
    slug: cat.slug,
    description: cat.description || '',
    sort_order: cat.sort_order
  }
}

function cancel() {
  editing.value = false
  editingId.value = null
  error.value = ''
}

function autoSlug() {
  if (!form.value.slug && form.value.name) {
    const map = { '心': 'xin', '理': 'li', '学': 'xue', '小': 'xiao', '说': 'shuo', '技': 'ji', '术': 'shu', '分': 'fen', '享': 'xiang' }
    form.value.slug = form.value.name
      .split('')
      .map((ch) => map[ch] || ch)
      .join('')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }
}

async function handleSubmit() {
  error.value = ''
  if (!form.value.name.trim()) {
    error.value = siteText.admin.categories.errors.nameRequired
    return
  }
  autoSlug()
  try {
    if (editingId.value) {
      await categories.update(editingId.value, { ...form.value })
    } else {
      await categories.create({ ...form.value })
    }
    cancel()
  } catch (e) {
    error.value = siteText.admin.categories.errors.saveFailed
  }
}

function confirmDelete(cat) {
  const count = bookCount(cat.id)
  if (confirm(siteText.admin.categories.confirmDelete(cat.name, count))) {
    categories.remove(cat.id)
  }
}
</script>

<template>
  <div>
    <div class="page-head">
      <h1 class="page-title serif">{{ siteText.admin.categories.title }}</h1>
      <button v-if="!editing" class="btn btn--primary" @click="startCreate">{{ siteText.admin.categories.newButton }}</button>
    </div>

    <div v-if="editing" class="form-card">
      <h3 class="form-card-title">{{ editingId ? siteText.admin.categories.editFormTitle : siteText.admin.categories.newFormTitle }}</h3>
      <form @submit.prevent="handleSubmit">
        <div class="form-grid">
          <div class="field">
            <label>{{ siteText.admin.categories.fields.name }}</label>
            <input v-model="form.name" type="text" :placeholder="siteText.admin.categories.placeholders.name" @blur="autoSlug" />
          </div>
          <div class="field">
            <label>{{ siteText.admin.categories.fields.slug }}</label>
            <input v-model="form.slug" type="text" :placeholder="siteText.admin.categories.placeholders.slug" />
          </div>
        </div>
        <div class="field">
          <label>{{ siteText.admin.categories.fields.description }}</label>
          <input v-model="form.description" type="text" :placeholder="siteText.admin.categories.placeholders.description" />
        </div>
        <div class="field">
          <label>{{ siteText.admin.categories.fields.sortOrder }}</label>
          <input v-model="form.sort_order" type="number" min="0" />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <div class="form-actions">
          <button type="button" class="btn btn--ghost" @click="cancel">{{ siteText.admin.categories.actions.cancel }}</button>
          <button type="submit" class="btn btn--primary">{{ siteText.admin.categories.actions.save }}</button>
        </div>
      </form>
    </div>

    <div v-if="categories.loading" class="state muted">{{ siteText.admin.categories.loading }}</div>

    <div v-else-if="categories.sorted.length" class="cat-list">
      <div v-for="cat in categories.sorted" :key="cat.id" class="cat-item">
        <div class="cat-info">
          <div class="cat-name-row">
            <span class="cat-name">{{ cat.name }}</span>
            <span class="badge">{{ siteText.admin.categories.bookCount(bookCount(cat.id)) }}</span>
          </div>
          <code class="cat-slug">{{ cat.slug }}</code>
          <p v-if="cat.description" class="cat-desc muted">{{ cat.description }}</p>
        </div>
        <div class="cat-actions">
          <button class="btn btn--ghost btn--sm" @click="startEdit(cat)">编辑</button>
          <button class="btn btn--danger btn--sm" @click="confirmDelete(cat)">删除</button>
        </div>
      </div>
    </div>

    <div v-else class="state empty">
      <p class="muted">{{ siteText.admin.categories.empty }}</p>
    </div>
  </div>
</template>

<style scoped>
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.page-title { font-size: 1.5rem; font-weight: 600; }

.form-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  margin-bottom: 28px;
}
.form-card-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 18px; }
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 18px;
}
.form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px; }
.error { color: var(--danger); font-size: 0.86rem; margin-bottom: 16px; }

.cat-list { display: flex; flex-direction: column; gap: 10px; }
.cat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px 20px;
  transition: border-color var(--transition);
}
.cat-item:hover { border-color: var(--accent-soft); }
.cat-info { flex: 1; min-width: 0; }
.cat-name-row { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
.cat-name { font-weight: 600; font-size: 1rem; }
.cat-slug {
  font-size: 0.78rem;
  color: var(--text-mute);
  background: var(--surface-2);
  padding: 2px 8px;
  border-radius: 4px;
}
.cat-desc { font-size: 0.84rem; margin-top: 6px; }
.cat-actions { display: flex; gap: 8px; flex-shrink: 0; }
.state { padding: 40px 0; }

@media (max-width: 640px) {
  .form-grid { grid-template-columns: 1fr; }
  .cat-item { flex-direction: column; align-items: flex-start; gap: 12px; }
}
</style>
