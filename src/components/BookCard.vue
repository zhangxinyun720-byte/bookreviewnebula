<script setup>
import { ref, watch } from 'vue'
import StarRating from '@/components/StarRating.vue'

const props = defineProps({
  book: { type: Object, required: true }
})

const imageError = ref(false)

watch(() => props.book.cover_url, () => {
  imageError.value = false
})

function onImageError() {
  imageError.value = true
}
</script>

<template>
  <article class="book-card">
    <router-link :to="`/books/${book.id}`" class="card-link">
      <div class="cover">
        <img
          v-if="book.cover_url && !imageError"
          :src="book.cover_url"
          :alt="book.title"
          loading="lazy"
          @error="onImageError"
        />
        <div v-else class="cover-placeholder">
          <span class="serif">{{ book.title?.charAt(0) || '书' }}</span>
        </div>
      </div>
      <div class="info">
        <div v-if="book.categories?.length" class="badges">
          <span v-for="cat in book.categories" :key="cat.id" class="badge">{{ cat.name }}</span>
        </div>
        <h3 class="title serif">{{ book.title }}</h3>
        <p v-if="book.author" class="author muted">{{ book.author }}</p>
        <StarRating v-if="book.rating" :model-value="book.rating" />
        <p v-if="book.summary" class="summary">{{ book.summary }}</p>
      </div>
    </router-link>
  </article>
</template>

<style scoped>
.book-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  transition: all var(--transition);
  height: 100%;
}
.book-card:hover {
  border-color: var(--accent-soft);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
.card-link { display: flex; flex-direction: column; height: 100%; }
.cover {
  aspect-ratio: 3 / 4;
  background: var(--surface-2);
  overflow: hidden;
}
.cover img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.book-card:hover .cover img { transform: scale(1.04); }
.cover-placeholder {
  width: 100%; height: 100%;
  display: grid; place-items: center;
  background: linear-gradient(135deg, var(--surface-2), var(--accent-soft));
  color: var(--accent);
}
.cover-placeholder span { font-size: 2.4rem; opacity: 0.7; }
.info {
  padding: 18px 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}
.title {
  font-size: 1.18rem;
  line-height: 1.4;
  font-weight: 600;
  color: var(--text);
}
.author { font-size: 0.86rem; }
.summary {
  font-size: 0.86rem;
  color: var(--text-mute);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.badges .badge {
  font-size: 0.72rem;
  padding: 2px 8px;
}
</style>
