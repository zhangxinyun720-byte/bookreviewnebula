import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

const SORT_KEY = 'bookreview_sort_order'

const BOOK_COLS = 'id,title,author,category_id,cover_url,rating,summary,review,status,created_at,updated_at'
const CAT_COLS = 'id,name,slug,description,created_at'
const BOOK_SELECT = `${BOOK_COLS}, book_categories(category:${CAT_COLS})`

function loadSortOrder() {
  try {
    return JSON.parse(localStorage.getItem(SORT_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveSortOrder(map) {
  localStorage.setItem(SORT_KEY, JSON.stringify(map))
}

function applyLocalSort(books) {
  const orderMap = loadSortOrder()
  return [...books].sort((a, b) => {
    const orderA = orderMap[a.id] ?? 999999
    const orderB = orderMap[b.id] ?? 999999
    return orderA - orderB
  })
}

function transformBook(book) {
  const categories = (book.book_categories || [])
    .map((bc) => bc.category)
    .filter(Boolean)
  const { book_categories, category_id, ...rest } = book
  return { ...rest, categories }
}

function transformBooks(data) {
  return applyLocalSort((data || []).map(transformBook))
}

export const useBooksStore = defineStore('books', {
  state: () => ({
    items: [],
    current: null,
    loading: false,
    saving: false
  }),

  actions: {
    async fetchPublished(categoryId = null) {
      this.loading = true
      try {
        const { data, error } = await supabase
          .from('books')
          .select(BOOK_SELECT)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
        if (error) throw error
        const sorted = transformBooks(data)
        this.items = categoryId
          ? sorted.filter((b) => b.categories.some((c) => c.id === categoryId))
          : sorted
        return this.items
      } finally {
        this.loading = false
      }
    },

    async fetchAllAdmin() {
      this.loading = true
      try {
        const { data, error } = await supabase
          .from('books')
          .select(BOOK_SELECT)
          .order('created_at', { ascending: false })
        if (error) throw error
        this.items = transformBooks(data)
        return this.items
      } finally {
        this.loading = false
      }
    },

    async fetchById(id) {
      this.loading = true
      try {
        const { data, error } = await supabase
          .from('books')
          .select(BOOK_SELECT)
          .eq('id', id)
          .single()
        if (error) throw error
        this.current = transformBook(data)
        return this.current
      } finally {
        this.loading = false
      }
    },

    async create(payload) {
      this.saving = true
      try {
        const { category_ids, ...bookData } = payload
        const { data, error } = await supabase
          .from('books')
          .insert(bookData)
          .select(BOOK_COLS)
          .single()
        if (error) throw error

        if (category_ids && category_ids.length) {
          const links = category_ids.map((cid) => ({
            book_id: data.id,
            category_id: cid
          }))
          const { error: linkError } = await supabase
            .from('book_categories')
            .insert(links)
          if (linkError) throw linkError
        }

        const orderMap = loadSortOrder()
        const maxOrder = Object.values(orderMap).length
        orderMap[data.id] = maxOrder
        saveSortOrder(orderMap)

        return data
      } finally {
        this.saving = false
      }
    },

    async update(id, payload) {
      this.saving = true
      try {
        const { category_ids, ...bookData } = payload
        const { data, error } = await supabase
          .from('books')
          .update(bookData)
          .eq('id', id)
          .select(BOOK_COLS)
          .single()
        if (error) throw error

        if (category_ids !== undefined) {
          await supabase
            .from('book_categories')
            .delete()
            .eq('book_id', id)

          if (category_ids.length) {
            const links = category_ids.map((cid) => ({
              book_id: id,
              category_id: cid
            }))
            const { error: linkError } = await supabase
              .from('book_categories')
              .insert(links)
            if (linkError) throw linkError
          }
        }

        return data
      } finally {
        this.saving = false
      }
    },

    async remove(id) {
      const { error } = await supabase.from('books').delete().eq('id', id)
      if (error) throw error
      this.items = this.items.filter((b) => b.id !== id)

      const orderMap = loadSortOrder()
      delete orderMap[id]
      saveSortOrder(orderMap)
    },

    async reorder(orderedIds) {
      if (!Array.isArray(orderedIds) || !orderedIds.length) return
      this.saving = true
      try {
        const orderMap = {}
        orderedIds.forEach((id, index) => {
          orderMap[id] = index
        })
        saveSortOrder(orderMap)

        this.items = orderedIds
          .map((id) => this.items.find((b) => b.id === id))
          .filter(Boolean)
      } finally {
        this.saving = false
      }
    }
  }
})