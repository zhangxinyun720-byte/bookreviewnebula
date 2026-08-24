import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

const BOOK_COLS = 'id,title,author,category_id,cover_url,rating,summary,review,status,sort_order,created_at,updated_at'
const CAT_COLS = 'id,name,slug,description,created_at'
const BOOK_SELECT = `${BOOK_COLS}, book_categories(category:${CAT_COLS})`

function transformBook(book) {
  const categories = (book.book_categories || [])
    .map((bc) => bc.category)
    .filter(Boolean)
  const { book_categories, category_id, ...rest } = book
  return { ...rest, categories }
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
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false })
        if (error) throw error
        const books = (data || []).map(transformBook)
        this.items = categoryId
          ? books.filter((b) => b.categories.some((c) => c.id === categoryId))
          : books
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
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false })
        if (error) throw error
        this.items = (data || []).map(transformBook)
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
    },

    async reorder(orderedIds) {
      if (!Array.isArray(orderedIds) || !orderedIds.length) return
      this.saving = true
      try {
        const updates = orderedIds.map((id, index) => ({
          id,
          sort_order: index
        }))

        for (const update of updates) {
          const { error } = await supabase
            .from('books')
            .update({ sort_order: update.sort_order })
            .eq('id', update.id)
          if (error) throw error
        }

        this.items = orderedIds
          .map((id) => this.items.find((b) => b.id === id))
          .filter(Boolean)
      } finally {
        this.saving = false
      }
    }
  }
})
