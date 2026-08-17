<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBooksStore } from '@/stores/books'
import { useAuthStore } from '@/stores/auth'
import { siteText } from '@/config/site'
import StarRating from '@/components/StarRating.vue'

const props = defineProps({ id: { type: String, required: true } })
const router = useRouter()
const books = useBooksStore()
const auth = useAuthStore()
const notFound = ref(false)
const imageError = ref(false)

watch(() => books.current?.cover_url, () => {
  imageError.value = false
})

function onImageError() {
  imageError.value = true
}

onMounted(async () => {
  try {
    await books.fetchById(props.id)
  } catch {
    notFound.value = true
  }
})

watch(() => props.id, () => {
  if (books.current?.id !== props.id) {
    books.fetchById(props.id)
  }
})
</script>

<template>
  <div class="container">
    <button class="back-btn" @click="router.push('/')">{{ siteText.bookDetail.back }}</button>

    <div v-if="books.loading" class="state muted text-center">{{ siteText.bookDetail.loading }}</div>

    <article v-else-if="books.current && !notFound" class="detail">
      <div class="meta-row">
        <div v-if="books.current.categories?.length" class="badges">
          <span v-for="cat in books.current.categories" :key="cat.id" class="badge">{{ cat.name }}</span>
        </div>
        <span class="muted date">{{ new Date(books.current.created_at).toLocaleDateString('zh-CN') }}</span>
        <router-link
          v-if="auth.isAuthenticated"
          :to="`/admin/books/${books.current.id}/edit`"
          class="edit-link"
        >{{ siteText.bookDetail.edit }}</router-link>
      </div>

      <h1 class="title serif">{{ books.current.title }}</h1>
      <p v-if="books.current.author" class="author">{{ siteText.bookDetail.author }}{{ books.current.author }}</p>

      <div class="rating-block">
        <StarRating :model-value="books.current.rating" />
        <span class="rating-num">{{ books.current.rating }}.0</span>
      </div>

      <div v-if="books.current.cover_url && !imageError" class="cover-wrap">
        <img :src="books.current.cover_url" :alt="books.current.title" class="cover" @error="onImageError" />
      </div>

      <div v-if="books.current.summary" class="summary">
        <p>{{ books.current.summary }}</p>
      </div>

      <div v-if="books.current.review" class="review serif">
        <h2 class="review-heading">{{ siteText.bookDetail.review }}</h2>
        <div class="review-body" v-html="books.current.review.replace(/\n/g, '<br>')"></div>
      </div>
    </article>

    <div v-else class="state empty text-center">
      <p class="muted">{{ siteText.bookDetail.notFound }}</p>
      <router-link to="/" class="btn btn--ghost" style="margin-top:16px">{{ siteText.bookDetail.backHome }}</router-link>
    </div>
  </div>
</template>

<style scoped>
.back-btn {
  color: var(--text-mute);
  font-size: 0.86rem;
  margin-bottom: 32px;
  transition: color var(--transition);
}
.back-btn:hover { color: var(--accent); }

.detail { max-width: 720px; margin: 0 auto; }
.meta-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.date { font-size: 0.8rem; }
.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.edit-link { font-size: 0.8rem; color: var(--accent); margin-left: auto; }

.title {
  font-size: clamp(1.8rem, 5vw, 2.6rem);
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.01em;
}
.author {
  margin-top: 8px;
  color: var(--text-soft);
  font-size: 1rem;
}
.rating-block {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
}
.rating-num { color: var(--accent); font-weight: 600; font-size: 0.9rem; }

.cover-wrap {
  float: right;
  width: 180px;
  margin: 0 0 16px 28px;
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}
.cover { width: 100%; }

.summary {
  background: var(--surface);
  border-left: 3px solid var(--accent-soft);
  padding: 18px 22px;
  border-radius: 0 var(--radius) var(--radius) 0;
  margin: 28px 0;
  font-size: 0.95rem;
  color: var(--text-soft);
  line-height: 1.8;
}

.review { margin-top: 40px; }
.review-heading {
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-mute);
  margin-bottom: 20px;
}
.review-body {
  font-size: 1.06rem;
  line-height: 1.9;
  color: var(--text);
  letter-spacing: 0.01em;
}
.state { padding: 60px 0; }

@media (max-width: 640px) {
  .cover-wrap { float: none; width: 130px; margin: 0 0 20px; }
}
</style>
