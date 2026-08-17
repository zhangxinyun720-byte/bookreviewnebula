import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    items: [],
    loaded: false,
    loading: false
  }),

  getters: {
    sorted: (state) => [...state.items].sort((a, b) => a.sort_order - b.sort_order),
    count: (state) => state.items.length
  },

  actions: {
    async fetchAll() {
      if (this.loaded) return
      this.loading = true
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true })
        if (error) throw error
        this.items = data || []
        this.loaded = true
      } finally {
        this.loading = false
      }
    },

    async create(payload) {
      const { data, error } = await supabase
        .from('categories')
        .insert(payload)
        .select()
        .single()
      if (error) throw error
      this.items.push(data)
      return data
    },

    async update(id, payload) {
      const { data, error } = await supabase
        .from('categories')
        .update(payload)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      const idx = this.items.findIndex((c) => c.id === id)
      if (idx !== -1) this.items[idx] = data
      return data
    },

    async remove(id) {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
      this.items = this.items.filter((c) => c.id !== id)
    }
  }
})
