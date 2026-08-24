<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBooksStore } from '@/stores/books'
import { siteText } from '@/config/site'

const router = useRouter()
const books = useBooksStore()
const filter = ref('')

const draggingId = ref(null)
const overId = ref(null)
const reorderSaving = ref(false)
const saveMessage = ref('')

onMounted(() => books.fetchAllAdmin())

function confirmDelete(book) {
  if (confirm(siteText.admin.books.confirmDelete(book.title))) {
    books.remove(book.id)
  }
}

const isFiltering = computed(() => !!filter.value)

const filtered = () => {
  if (!filter.value) return books.items
  const q = filter.value.toLowerCase()
  return books.items.filter(
    (b) => b.title?.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q)
  )
}

const onDragStart = (e, book) => {
  draggingId.value = book.id
  overId.value = book.id
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', book.id)
}

const onDragOver = (e, book) => {
  if (!draggingId.value) return
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
  overId.value = book.id
}

const onDragLeave = () => {
  overId.value = null
}

const onDragEnd = () => {
  draggingId.value = null
  overId.value = null
}

const onDrop = async (e, targetBook) => {
  e.preventDefault()
  const sourceId = draggingId.value
  draggingId.value = null
  overId.value = null
  if (!sourceId || sourceId === targetBook.id || isFiltering.value) return

  const currentList = filtered().map((b) => b.id)
  const fromIndex = currentList.indexOf(sourceId)
  const toIndex = currentList.indexOf(targetBook.id)
  if (fromIndex < 0 || toIndex < 0) return

  const nextList = [...currentList]
  nextList.splice(fromIndex, 1)
  nextList.splice(toIndex, 0, sourceId)

  try {
    reorderSaving.value = true
    saveMessage.value = ''
    await books.reorder(nextList)
    saveMessage.value = '排序已保存'
    setTimeout(() => (saveMessage.value = ''), 2000)
  } catch {
    saveMessage.value = '保存排序失败，请重试'
  } finally {
    reorderSaving.value = false
  }
}

const moveUp = async (book) => {
  if (isFiltering.value) return
  const list = filtered().map((b) => b.id)
  const idx = list.indexOf(book.id)
  if (idx <= 0) return
  const nextList = [...list]
  ;[nextList[idx - 1], nextList[idx]] = [nextList[idx], nextList[idx - 1]]
  await persistReorder(nextList)
}

const moveDown = async (book) => {
  if (isFiltering.value) return
  const list = filtered().map((b) => b.id)
  const idx = list.indexOf(book.id)
  if (idx < 0 || idx >= list.length - 1) return
  const nextList = [...list]
  ;[nextList[idx + 1], nextList[idx]] = [nextList[idx], nextList[idx + 1]]
  await persistReorder(nextList)
}

const persistReorder = async (nextList) => {
  try {
    reorderSaving.value = true
    saveMessage.value = ''
    await books.reorder(nextList)
    saveMessage.value = '排序已保存'
    setTimeout(() => (saveMessage.value = ''), 2000)
  } catch {
    saveMessage.value = '保存排序失败，请重试'
  } finally {
    reorderSaving.value = false
  }
}
</script>

<template>
  <div>
    <div class="page-head">
      <h1 class="page-title serif">{{ siteText.admin.books.title }}</h1>
      <router-link to="/admin/books/new" class="btn btn--primary">{{ siteText.admin.books.newButton }}</router-link>
    </div>

    <div class="field">
      <input v-model="filter" type="text" :placeholder="siteText.admin.books.searchPlaceholder" />
    </div>

    <div v-if="saveMessage" class="save-toast" :class="{ error: saveMessage.includes('失败') }">
      {{ saveMessage }}
    </div>

    <div v-if="books.loading" class="state muted">加载中…</div>

    <div v-else-if="filtered().length" class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th class="col-drag" aria-label="拖动排序"></th>
            <th>{{ siteText.admin.books.headers.title }}</th>
            <th>{{ siteText.admin.books.headers.author }}</th>
            <th>{{ siteText.admin.books.headers.category }}</th>
            <th>{{ siteText.admin.books.headers.rating }}</th>
            <th>{{ siteText.admin.books.headers.status }}</th>
            <th class="col-actions">{{ siteText.admin.books.headers.actions }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="book in filtered()"
            :key="book.id"
            class="book-row"
            :class="{
              dragging: draggingId === book.id,
              'drag-over': overId === book.id && draggingId !== book.id,
              disabled: isFiltering
            }"
            :draggable="!isFiltering"
            @dragstart="onDragStart($event, book)"
            @dragover="onDragOver($event, book)"
            @dragleave="onDragLeave"
            @dragend="onDragEnd"
            @drop="onDrop($event, book)"
          >
            <td class="col-drag">
              <span
                class="drag-handle"
                :title="isFiltering ? '清除搜索后可拖动排序' : '拖动以改变显示顺序'"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <circle cx="5" cy="3" r="1.3" />
                  <circle cx="5" cy="8" r="1.3" />
                  <circle cx="5" cy="13" r="1.3" />
                  <circle cx="11" cy="3" r="1.3" />
                  <circle cx="11" cy="8" r="1.3" />
                  <circle cx="11" cy="13" r="1.3" />
                </svg>
              </span>
              <div class="row-actions" v-if="!isFiltering">
                <button class="icon-btn" @click="moveUp(book)" title="上移" aria-label="上移">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 10 8 5 13 10" /></svg>
                </button>
                <button class="icon-btn" @click="moveDown(book)" title="下移" aria-label="下移">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 8 11 13 6" /></svg>
                </button>
              </div>
            </td>
            <td class="col-title">
              <router-link :to="`/books/${book.id}`" class="book-link">{{ book.title }}</router-link>
            </td>
            <td class="muted">{{ book.author || '—' }}</td>
            <td>
              <div v-if="book.categories?.length" class="cat-badges">
                <span v-for="cat in book.categories" :key="cat.id" class="badge">{{ cat.name }}</span>
              </div>
              <span v-else class="muted">—</span>
            </td>
            <td>{{ book.rating }}/5</td>
            <td>
              <span class="status-dot" :class="book.status"></span>
              {{ book.status === 'draft' ? siteText.admin.books.status.draft : siteText.admin.books.status.published }}
            </td>
            <td class="col-actions">
              <router-link :to="`/admin/books/${book.id}/edit`" class="btn btn--ghost btn--sm">编辑</router-link>
              <button class="btn btn--danger btn--sm" @click="confirmDelete(book)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="isFiltering" class="hint muted">搜索中无法拖动排序，请清空搜索框后再试。</p>
      <p v-else class="hint muted">拖动左侧排序手柄，或使用上下箭头按钮调整前台展示顺序。</p>
    </div>

    <div v-else class="state empty">
      <p class="muted">{{ siteText.admin.books.empty }}</p>
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
.table-wrap {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  overflow-x: auto;
}
.table { width: 100%; border-collapse: collapse; }
.table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--text-mute);
  border-bottom: 1px solid var(--border);
  background: var(--surface-2);
}
.table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  font-size: 0.9rem;
  vertical-align: middle;
}
.table tr:last-child td { border-bottom: none; }
.book-row { transition: background 0.15s ease; }
.book-row:hover td { background: var(--surface-2); }
.book-row.dragging {
  opacity: 0.45;
  background: var(--surface-2);
}
.book-row.drag-over {
  box-shadow: inset 0 3px 0 0 var(--accent);
}
.book-row.disabled { cursor: default; }
.book-row.disabled .drag-handle { cursor: not-allowed; opacity: 0.4; }
.col-drag {
  width: 88px;
  padding: 8px 12px 8px 10px !important;
  color: var(--text-mute);
  user-select: none;
}
.drag-handle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  cursor: grab;
  border-radius: 6px;
  color: var(--text-mute);
  transition: all 0.15s ease;
}
.drag-handle:hover {
  background: var(--surface-2);
  color: var(--accent);
}
.book-row.dragging .drag-handle { cursor: grabbing; }
.row-actions {
  display: inline-flex;
  gap: 2px;
  margin-left: 6px;
  vertical-align: middle;
}
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--text-mute);
  cursor: pointer;
  transition: all 0.15s ease;
}
.icon-btn:hover {
  background: var(--surface-2);
  color: var(--accent);
}
.col-title { min-width: 160px; }
.book-link { font-weight: 500; color: var(--text); }
.book-link:hover { color: var(--accent); }
.col-actions { white-space: nowrap; }
.col-actions .btn + .btn { margin-left: 8px; }
.status-dot {
  display: inline-block;
  width: 8px; height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}
.status-dot.published { background: #6ba368; }
.status-dot.draft { background: var(--text-mute); }
.cat-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.cat-badges .badge {
  font-size: 0.72rem;
  padding: 2px 8px;
}
.state { padding: 40px 0; }
.save-toast {
  position: sticky;
  top: 0;
  z-index: 5;
  text-align: center;
  padding: 8px 12px;
  margin-bottom: 12px;
  background: var(--accent-soft, rgba(107,163,104,0.12));
  color: var(--accent, #6ba368);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.85rem;
}
.save-toast.error {
  background: rgba(220, 80, 80, 0.12);
  color: #c0392b;
}
.hint {
  margin: 8px 0 0;
  font-size: 0.78rem;
  text-align: right;
}
</style>