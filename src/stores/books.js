import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

function transformBook(book) {
  const categories = (book.book_categories || [])
    .map((bc) => bc.category)
    .filter(Boolean)
  const { book_categories, category_id, ...rest } = book
  return { ...rest, categories }
}

function transformBooks(data) {
  return (data || []).map(transformBook)
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
          .select('*, book_categories(category:categories(*))')
          .eq('status', 'published')
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false })
        if (error) throw error
        const transformed = transformBooks(data)
        this.items = categoryId
          ? transformed.filter((b) => b.categories.some((c) => c.id === categoryId))
          : transformed
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
          .select('*, book_categories(category:categories(*))')
          .order('sort_order', { ascending: true })
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
          .select('*, book_categories(category:categories(*))')
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
        const { data: maxData } = await supabase
          .from('books')
          .select('sort_order')
          .order('sort_order', { ascending: false })
          .limit(1)
        const nextSortOrder = (maxData?.[0]?.sort_order ?? -1) + 1
        const { data, error } = await supabase
          .from('books')
          .insert({ ...bookData, sort_order: nextSortOrder })
          .select()
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
          .select()
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
        const results = await Promise.all(
          orderedIds.map((id, index) =>
            supabase
              .from('books')
              .update({ sort_order: index })
              .eq('id', id)
          )
        )
        const firstError = results.find((r) => r.error)
        if (firstError) throw firstError
        this.items = orderedIds
          .map((id, index) => {
            const existing = this.items.find((b) => b.id === id)
            return existing ? { ...existing, sort_order: index } : null
          })
          .filter(Boolean)
          .sort((a, b) => a.sort_order - b.sort_order)
      } finally {
        this.saving = false
      }
    }
  }
})