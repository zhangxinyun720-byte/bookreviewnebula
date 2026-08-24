<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useBooksStore } from '@/stores/books'
import { useCategoriesStore } from '@/stores/categories'
import { siteText } from '@/config/site'
import BookCard from '@/components/BookCard.vue'
import CategoryFilter from '@/components/CategoryFilter.vue'

const books = useBooksStore()
const categories = useCategoriesStore()
const activeSlug = ref('all')

const activeCategory = computed(() =>
  categories.items.find((c) => c.slug === activeSlug.value) || null
)

async function load() {
  await categories.fetchAll()
  await books.fetchPublished(activeCategory.value?.id || null)
}

watch(activeSlug, () => {
  if (categories.loaded) {
    books.fetchPublished(activeCategory.value?.id || null)
  }
})

onMounted(load)
</script>

<template>
  <div class="container">
    <section class="hero">
      <p class="hero-eyebrow muted">{{ siteText.home.eyebrow }}</p>
      <h1 class="hero-title serif">
        {{ siteText.home.title }}
      </h1>
      <p class="hero-sub">
        {{ siteText.home.subtitle }}
      </p>
    </section>

    <CategoryFilter v-model="activeSlug" :categories="categories.sorted" />

    <div v-if="books.loading" class="state muted text-center">{{ siteText.home.loading }}</div>

    <div v-else-if="books.items.length" class="grid">
      <BookCard v-for="book in books.items" :key="book.id" :book="book" />
    </div>

    <div v-else class="state empty">
      <p class="muted">{{ siteText.home.empty }}</p>
    </div>
  </div>
</template>

<style scoped>
.hero {
  text-align: center;
  padding: 24px 0 48px;
}
.hero-eyebrow {
  font-size: 0.8rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  margin-bottom: 16px;
}
.hero-title {
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.01em;
}
.hero-sub {
  margin-top: 16px;
  color: var(--text-soft);
  font-size: 1rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
@media (max-width: 900px) {
  .grid { grid-template-columns: repeat(2, 1fr); gap: 18px; }
}
@media (max-width: 600px) {
  .grid { grid-template-columns: 1fr; }
}
.state { padding: 60px 0; }
</style>