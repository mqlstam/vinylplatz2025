import { useAuthStore } from '../stores/auth';
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';

export const authGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore();
  
  if (!authStore.isAuthenticated) {
    // Redirect to login page with return url
    return next({
      path: '/login',
      query: { redirect: to.fullPath }
    });
  }
  
  // User is authenticated, proceed
  next();
};

export const adminGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore();
  
  if (!authStore.isAuthenticated) {
    // Redirect to login page with return url
    return next({
      path: '/login',
      query: { redirect: to.fullPath }
    });
  }
  
  if (!authStore.isAdmin) {
    // User is not an admin, redirect to home
    return next({ path: '/' });
  }
  
  // User is admin, proceed
  next();
};

export const guestGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore();
  
  if (authStore.isAuthenticated) {
    // User is already authenticated, redirect to home
    return next({ path: '/' });
  }
  
  // User is not authenticated, proceed
  next();
};
