import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/books/:id',
    name: 'book-detail',
    component: () => import('@/views/BookDetailView.vue'),
    props: true
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'admin-books',
        component: () => import('@/views/admin/AdminBooksView.vue')
      },
      {
        path: 'books/new',
        name: 'admin-book-new',
        component: () => import('@/views/admin/AdminBookFormView.vue')
      },
      {
        path: 'books/:id/edit',
        name: 'admin-book-edit',
        component: () => import('@/views/admin/AdminBookFormView.vue'),
        props: true
      },
      {
        path: 'categories',
        name: 'admin-categories',
        component: () => import('@/views/admin/AdminCategoriesView.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, saved) {
    return saved || { top: 0 }
  }
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!auth.initialized) await auth.init()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'admin-books' }
  }
  return true
})

export default router
