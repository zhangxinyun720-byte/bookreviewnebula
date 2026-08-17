import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    initialized: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.user
  },

  actions: {
    async init() {
      const { data: { session } } = await supabase.auth.getSession()
      this.user = session?.user || null
      this.initialized = true

      supabase.auth.onAuthStateChange((_event, session) => {
        this.user = session?.user || null
      })
    },

    async signIn(email, password) {
      this.loading = true
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } finally {
        this.loading = false
      }
    },

    async signOut() {
      await supabase.auth.signOut()
      this.user = null
    }
  }
})
