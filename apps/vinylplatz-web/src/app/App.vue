<script setup lang="ts">
import { useAuthStore } from './stores/auth';
import { ref } from 'vue';

const auth = useAuthStore();
const mobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};

const handleLogout = () => {
  auth.logout();
  closeMobileMenu();
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="container mx-auto px-4">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <router-link to="/" class="text-xl font-bold text-indigo-600">VinylPlatz</router-link>
            </div>
            <nav class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link to="/" class="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">Home</router-link>
              <router-link to="/genres" class="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">Genres</router-link>
              <router-link to="/about" class="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">About</router-link>
            </nav>
          </div>
          
          <div class="hidden sm:ml-6 sm:flex sm:items-center">
            <div v-if="auth.isAuthenticated" class="ml-3 relative">
              <div class="flex items-center space-x-4">
                <router-link v-if="auth.isAdmin" to="/admin" class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                  Admin
                </router-link>
                <router-link to="/profile" class="text-sm font-medium text-gray-500 hover:text-gray-700">
                  {{ auth.user?.name || 'Profile' }}
                </router-link>
                <button @click="handleLogout" class="text-sm font-medium text-gray-500 hover:text-gray-700">
                  Logout
                </button>
              </div>
            </div>
            <div v-else class="flex items-center space-x-4">
              <router-link to="/login" class="text-sm font-medium text-gray-500 hover:text-gray-700">
                Sign in
              </router-link>
              <router-link to="/register" class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                Register
              </router-link>
            </div>
          </div>
          
          <!-- Mobile menu button -->
          <div class="flex items-center sm:hidden">
            <button @click="toggleMobileMenu" type="button" class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500" aria-controls="mobile-menu" :aria-expanded="mobileMenuOpen">
              <span class="sr-only">Open main menu</span>
              <svg v-if="!mobileMenuOpen" class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg v-else class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Mobile menu -->
      <div v-show="mobileMenuOpen" id="mobile-menu" class="sm:hidden">
        <div class="pt-2 pb-3 space-y-1">
          <router-link to="/" @click="closeMobileMenu" class="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">Home</router-link>
          <router-link to="/genres" @click="closeMobileMenu" class="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">Genres</router-link>
          <router-link to="/about" @click="closeMobileMenu" class="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">About</router-link>
        </div>
        <div class="pt-4 pb-3 border-t border-gray-200">
          <div v-if="auth.isAuthenticated" class="space-y-1">
            <router-link v-if="auth.isAdmin" to="/admin" @click="closeMobileMenu" class="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">Admin</router-link>
            <router-link to="/profile" @click="closeMobileMenu" class="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">Profile</router-link>
            <button @click="handleLogout" class="w-full text-left block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">Logout</button>
          </div>
          <div v-else class="space-y-1">
            <router-link to="/login" @click="closeMobileMenu" class="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">Sign in</router-link>
            <router-link to="/register" @click="closeMobileMenu" class="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">Register</router-link>
          </div>
        </div>
      </div>
    </header>
    
    <main>
      <router-view />
    </main>
    
    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="container mx-auto px-4 py-6">
        <p class="text-center text-sm text-gray-500">© {{ new Date().getFullYear() }} VinylPlatz. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>
