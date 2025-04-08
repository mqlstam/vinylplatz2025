import { createRouter, createWebHistory } from 'vue-router';
import { authGuard, adminGuard, guestGuard } from '../guards/auth.guard';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue')
  },
  // Auth routes
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/auth/LoginView.vue'),
    beforeEnter: guestGuard
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/auth/RegisterView.vue'),
    beforeEnter: guestGuard
  },
  // Protected routes
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/ProfileView.vue'),
    beforeEnter: authGuard
  },
  {
    path: '/profile/settings',
    name: 'profile-settings',
    component: () => import('../views/profile/UserProfileSettings.vue'),
    beforeEnter: authGuard
  },
  // Genre routes
  {
    path: '/genres',
    name: 'genres',
    component: () => import('../views/genre/GenreList.vue')
  },
  // Vinyl routes
  {
    path: '/vinyls',
    name: 'vinyls',
    component: () => import('../views/vinyl/VinylList.vue')
  },
  {
    path: '/vinyls/new',
    name: 'new-vinyl',
    component: () => import('../views/vinyl/VinylForm.vue'),
    beforeEnter: authGuard
  },
  {
    path: '/vinyls/:id',
    name: 'vinyl-detail',
    component: () => import('../views/vinyl/VinylDetail.vue')
  },
  {
    path: '/vinyls/edit/:id',
    name: 'edit-vinyl',
    component: () => import('../views/vinyl/VinylForm.vue'),
    beforeEnter: authGuard
  },
  {
    path: '/my-vinyls',
    name: 'my-vinyls',
    component: () => import('../views/vinyl/MyVinylListings.vue'),
    beforeEnter: authGuard
  },
  // Admin routes
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminView.vue'),
    beforeEnter: adminGuard
  },
  // 404 route
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
