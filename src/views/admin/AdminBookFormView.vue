<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBooksStore } from '@/stores/books'
import { useCategoriesStore } from '@/stores/categories'
import { siteText } from '@/config/site'
import { uploadCover } from '@/lib/storage'
import StarRating from '@/components/StarRating.vue'

const props = defineProps({ id: { type: String, default: null } })
const router = useRouter()
const books = useBooksStore()
const categories = useCategoriesStore()

const isEdit = computed(() => !!props.id)
const saving = computed(() => books.saving)
const error = ref('')
const showAdvanced = ref(false)

const uploading = ref(false)
const uploadError = ref('')
const uploadInput = ref(null)
const previewError = ref(false)

const form = ref({
  title: '',
  author: '',
  category_ids: [],
  cover_url: '',
  rating: 0,
  summary: '',
  review: '',
  status: 'published'
})

onMounted(async () => {
  await categories.fetchAll()
  if (isEdit.value) {
    try {
      const book = await books.fetchById(props.id)
      form.value = {
        title: book.title || '',
        author: book.author || '',
        category_ids: (book.categories || []).map((c) => c.id),
        cover_url: book.cover_url || '',
        rating: book.rating || 0,
        summary: book.summary || '',
        review: book.review || '',
        status: book.status || 'published'
      }
    } catch {
      error.value = siteText.admin.bookForm.errors.notFound
    }
  }
})

function onPreviewError() {
  previewError.value = true
}

function triggerFileSelect() {
  uploadInput.value?.click()
}

async function handleFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return

  uploadError.value = ''
  previewError.value = false
  uploading.value = true

  try {
    const url = await uploadCover(file)
    form.value.cover_url = url
  } catch (err) {
    if (err.message === 'invalid_type') {
      uploadError.value = siteText.admin.bookForm.upload.invalidType
    } else if (err.message === 'file_too_large') {
      uploadError.value = siteText.admin.bookForm.upload.fileTooLarge
    } else {
      uploadError.value = err.message || siteText.admin.bookForm.upload.uploadFailed
    }
  } finally {
    uploading.value = false
    if (uploadInput.value) uploadInput.value.value = ''
  }
}

function removeCover() {
  form.value.cover_url = ''
  previewError.value = false
}

async function handleSubmit() {
  error.value = ''
  if (!form.value.title.trim()) {
    error.value = siteText.admin.bookForm.errors.titleRequired
    return
  }
  const payload = { ...form.value }

  try {
    if (isEdit.value) {
      await books.update(props.id, payload)
    } else {
      await books.create(payload)
    }
    router.push('/admin')
  } catch (e) {
    error.value = siteText.admin.bookForm.errors.saveFailed
  }
}
</script>

<template>
  <div class="form-page">
    <div class="page-head">
      <h1 class="page-title serif">{{ isEdit ? siteText.admin.bookForm.editTitle : siteText.admin.bookForm.newTitle }}</h1>
      <router-link to="/admin" class="back-link">{{ siteText.admin.bookForm.back }}</router-link>
    </div>

    <form @submit.prevent="handleSubmit" class="book-form">
      <div class="field">
        <label>{{ siteText.admin.bookForm.fields.title }}</label>
        <input v-model="form.title" type="text" :placeholder="siteText.admin.bookForm.placeholders.title" required />
      </div>

      <div class="field">
        <label>{{ siteText.admin.bookForm.fields.cover }}</label>

        <div v-if="form.cover_url && !previewError" class="cover-preview">
          <img :src="form.cover_url" :alt="siteText.admin.bookForm.upload.preview" class="cover-thumb" @error="onPreviewError" />
          <div class="cover-actions">
            <button type="button" class="btn btn--ghost btn--sm" @click="triggerFileSelect" :disabled="uploading">
              {{ siteText.admin.bookForm.upload.replace }}
            </button>
            <button type="button" class="btn btn--ghost btn--sm" @click="removeCover">
              {{ siteText.admin.bookForm.upload.remove }}
            </button>
          </div>
        </div>

        <div v-else class="cover-upload" @click="triggerFileSelect" :class="{ disabled: uploading }">
          <div v-if="uploading" class="upload-loading">
            <div class="spinner"></div>
            <span>{{ siteText.admin.bookForm.upload.uploading }}</span>
          </div>
          <div v-else class="upload-prompt">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span>{{ siteText.admin.bookForm.upload.selectFile }}</span>
            <small>JPG · PNG · WebP · GIF · 最大 5MB</small>
          </div>
        </div>

        <input
          ref="uploadInput"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          @change="handleFileChange"
          style="display: none"
        />

        <p v-if="uploadError" class="error">{{ uploadError }}</p>

        <div class="cover-url-alt">
          <span class="muted">{{ siteText.admin.bookForm.upload.orPasteUrl }}</span>
          <input v-model="form.cover_url" type="url" :placeholder="siteText.admin.bookForm.placeholders.cover" />
        </div>
      </div>

      <div class="field">
        <label>{{ siteText.admin.bookForm.fields.rating }}</label>
        <StarRating v-model="form.rating" :readonly="false" />
      </div>

      <div class="field">
        <label>{{ siteText.admin.bookForm.fields.review }}</label>
        <textarea v-model="form.review" rows="12" :placeholder="siteText.admin.bookForm.placeholders.review" class="review-input"></textarea>
      </div>

      <div class="advanced-toggle" @click="showAdvanced = !showAdvanced">
        <span>{{ showAdvanced ? siteText.admin.bookForm.fields.less : siteText.admin.bookForm.fields.more }}</span>
        <svg class="chevron" :class="{ open: showAdvanced }" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <div v-if="showAdvanced" class="advanced">
        <div class="field-row">
          <div class="field">
            <label>{{ siteText.admin.bookForm.fields.author }}</label>
            <input v-model="form.author" type="text" :placeholder="siteText.admin.bookForm.placeholders.author" />
          </div>
          <div class="field">
            <label>{{ siteText.admin.bookForm.fields.category }}</label>
            <div v-if="categories.sorted.length" class="checkbox-list">
              <label v-for="cat in categories.sorted" :key="cat.id" class="checkbox-item">
                <input type="checkbox" :value="cat.id" v-model="form.category_ids" />
                <span>{{ cat.name }}</span>
              </label>
            </div>
            <p v-else class="muted">还没有分类，请先去分类管理创建。</p>
          </div>
        </div>

        <div class="field">
          <label>{{ siteText.admin.bookForm.fields.summary }}</label>
          <textarea v-model="form.summary" rows="2" :placeholder="siteText.admin.bookForm.placeholders.summary"></textarea>
        </div>

        <div class="field">
          <label>{{ siteText.admin.bookForm.fields.status }}</label>
          <div class="radio-row">
            <label class="radio">
              <input type="radio" v-model="form.status" value="published" />
              <span>{{ siteText.admin.bookForm.fields.publish }}</span>
            </label>
            <label class="radio">
              <input type="radio" v-model="form.status" value="draft" />
              <span>{{ siteText.admin.bookForm.fields.draft }}</span>
            </label>
          </div>
        </div>
      </div>

      <p v-if="error" class="error">{{ error }}</p>

      <div class="form-actions">
        <button type="button" class="btn btn--ghost" @click="router.push('/admin')">{{ siteText.admin.bookForm.actions.cancel }}</button>
        <button type="submit" class="btn btn--primary" :disabled="saving">
          {{ saving ? siteText.admin.bookForm.actions.saving : (isEdit ? siteText.admin.bookForm.actions.save : siteText.admin.bookForm.actions.create) }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-page { max-width: 640px; }
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}
.page-title { font-size: 1.5rem; font-weight: 600; }
.back-link { font-size: 0.86rem; color: var(--text-mute); }
.back-link:hover { color: var(--accent); }
.review-input { font-family: var(--font-serif); font-size: 1rem; line-height: 1.8; }
.radio-row { display: flex; gap: 20px; }
.radio { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; cursor: pointer; }
.radio input { width: auto; }
.error { color: var(--danger); font-size: 0.86rem; margin-bottom: 16px; }
.form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px; }

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.advanced-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: var(--text-mute);
  font-size: 0.86rem;
  padding: 12px 0;
  border-top: 1px solid var(--border);
  margin: 8px 0 0;
  user-select: none;
  transition: color 0.2s;
}
.advanced-toggle:hover { color: var(--accent); }
.advanced-toggle .chevron { transition: transform 0.2s; }
.advanced-toggle .chevron.open { transform: rotate(180deg); }

.advanced {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 18px;
  background: var(--bg-subtle);
  border-radius: 10px;
  margin-top: 4px;
}

@media (max-width: 640px) {
  .field-row { grid-template-columns: 1fr; }
}

.cover-preview {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 12px;
  background: var(--surface-2);
  border-radius: 10px;
  border: 1px solid var(--border);
}
.cover-thumb {
  width: 96px;
  height: 128px;
  object-fit: cover;
  border-radius: 6px;
  background: var(--surface);
}
.cover-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}
.btn--sm {
  padding: 4px 12px;
  font-size: 0.8rem;
}

.cover-upload {
  border: 2px dashed var(--border);
  border-radius: 10px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--surface-2);
}
.cover-upload:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.cover-upload.disabled {
  pointer-events: none;
  opacity: 0.6;
}
.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-mute);
}
.upload-prompt svg {
  color: var(--accent);
}
.upload-prompt span {
  font-size: 0.9rem;
  color: var(--text);
  font-weight: 500;
}
.upload-prompt small {
  font-size: 0.76rem;
  color: var(--text-mute);
}
.upload-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: var(--text-mute);
  font-size: 0.9rem;
}
.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.cover-url-alt {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.cover-url-alt .muted {
  font-size: 0.8rem;
  color: var(--text-mute);
}
.cover-url-alt input {
  font-size: 0.88rem;
}

.checkbox-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  padding: 8px 0;
}
.checkbox-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: var(--surface);
  transition: all var(--transition);
}
.checkbox-item:hover { border-color: var(--accent); }
.checkbox-item input { width: auto; accent-color: var(--accent); }
</style>
