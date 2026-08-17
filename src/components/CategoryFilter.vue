<script setup>
import { siteText } from '@/config/site'

const props = defineProps({
  categories: { type: Array, default: () => [] },
  modelValue: { type: String, default: 'all' }
})
const emit = defineEmits(['update:modelValue'])

function select(slug) {
  emit('update:modelValue', slug)
}
</script>

<template>
  <div class="filter-bar">
    <button
      class="pill"
      :class="{ active: modelValue === 'all' }"
      @click="select('all')"
    >
      {{ siteText.filter.all }}
    </button>
    <button
      v-for="cat in categories"
      :key="cat.id"
      class="pill"
      :class="{ active: modelValue === cat.slug }"
      @click="select(cat.slug)"
    >
      {{ cat.name }}
    </button>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 32px;
}
.pill {
  padding: 7px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  color: var(--text-soft);
  background: var(--surface);
  border: 1px solid var(--border);
  transition: all var(--transition);
}
.pill:hover { border-color: var(--accent); color: var(--accent); }
.pill.active {
  background: var(--text);
  color: var(--bg);
  border-color: var(--text);
}
</style>
