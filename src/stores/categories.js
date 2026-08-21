import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

const CATEGORY_SORT_KEY = 'bookreview_category_sort'

const CAT_COLS = 'id,name,slug,description,created_at'

function loadCategorySort() {
  try {
    return JSON.parse(localStorage.getItem(CATEGORY_SORT_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveCategorySort(map) {
  localStorage.setItem(CATEGORY_SORT_KEY, JSON.stringify(map))
}

function applyCategorySort(categories) {
  const orderMap = loadCategorySort()
  return [...categories].sort((a, b) => {
    const orderA = orderMap[a.id] ?? 999999
    const orderB = orderMap[b.id] ?? 999999
    return orderA - orderB
  })
}

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    items: [],
    loaded: false,
    loading: false
  }),

  getters: {
    sorted: (state) => applyCategorySort(state.items),
    count: (state) => state.items.length
  },

  actions: {
    async fetchAll() {
      if (this.loaded) return
      this.loading = true
      try {
        const { data, error } = await supabase
          .from('categories')
          .select(CAT_COLS)
          .order('created_at', { ascending: true })
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
        .select(CAT_COLS)
        .single()
      if (error) throw error
      this.items.push(data)

      const orderMap = loadCategorySort()
      const maxOrder = Object.values(orderMap).length
      orderMap[data.id] = maxOrder
      saveCategorySort(orderMap)

      return data
    },

    async update(id, payload) {
      const { data, error } = await supabase
        .from('categories')
        .update(payload)
        .eq('id', id)
        .select(CAT_COLS)
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

      const orderMap = loadCategorySort()
      delete orderMap[id]
      saveCategorySort(orderMap)
    }
  }
})