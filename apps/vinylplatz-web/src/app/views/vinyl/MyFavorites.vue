<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { Vinyl } from '../../services/vinyl.service';
import { favoritesService } from '../../services/favorites.service';

const router = useRouter();
const auth = useAuthStore();

// Data
const favorites = ref<Vinyl[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const removingIds = ref<Set<string>>(new Set());

// Load user's favorites
const loadFavorites = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    favorites.value = await favoritesService.getFavorites();
  } catch (err) {
    console.error('Error loading favorites:', err);
    error.value = 'Failed to load your favorites. Please try again later.';
  } finally {
    loading.value = false;
  }
};

// View vinyl details
const viewVinyl = (id: string) => {
  router.push(`/vinyls/${id}`);
};

// Remove a vinyl from favorites
const removeFromFavorites = async (vinyl: Vinyl, event: Event) => {
  event.stopPropagation(); // Prevent triggering the parent click
  
  if (removingIds.value.has(vinyl.id)) return; // Already removing
  
  removingIds.value.add(vinyl.id);
  
  try {
    await favoritesService.removeFromFavorites(vinyl.id);
    // Remove from the local list
    favorites.value = favorites.value.filter(fav => fav.id !== vinyl.id);
  } catch (err) {
    console.error('Error removing from favorites:', err);
    error.value = 'Failed to remove from favorites. Please try again.';
  } finally {
    removingIds.value.delete(vinyl.id);
  }
};

// Format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

// Go to browse vinyls
const browsePage = () => {
  router.push('/vinyls');
};

// Lifecycle hooks
onMounted(() => {
  // Redirect if not authenticated
  if (!auth.isAuthenticated) {
    router.push('/login');
    return;
  }
  
  loadFavorites();
});
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <h1 class="text-3xl font-bold mb-6">My Favorite Vinyls</h1>
    
    <!-- Loading state -->
    <div v-if="loading" class="text-center py-12">
      <p class="text-xl text-gray-600">Loading your favorites...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 p-4 rounded-md mb-4">
      <p class="text-red-800">{{ error }}</p>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="favorites.length === 0" class="text-center py-12 bg-white shadow rounded-lg">
      <h3 class="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
      <p class="text-gray-600 mb-6">You haven't added any vinyl records to your favorites yet.</p>
      <button 
        @click="browsePage" 
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Browse Vinyls
      </button>
    </div>
    
    <!-- Favorites grid -->
    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div 
        v-for="vinyl in favorites" 
        :key="vinyl.id" 
        class="bg-white overflow-hidden shadow rounded-lg cursor-pointer transition-shadow hover:shadow-md relative"
        @click="viewVinyl(vinyl.id)"
      >
        <!-- Vinyl Cover -->
        <div class="h-48 bg-gray-200 overflow-hidden">
          <img 
            v-if="vinyl.coverImageUrl" 
            :src="vinyl.coverImageUrl" 
            :alt="vinyl.title" 
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center bg-gray-100">
            <svg class="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          
          <!-- Remove favorite button -->
          <button
            @click="removeFromFavorites(vinyl, $event)"
            :disabled="removingIds.has(vinyl.id)"
            class="absolute top-2 right-2 p-1.5 rounded-full bg-white bg-opacity-90 text-pink-600 hover:text-pink-700 shadow focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-pink-500"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        
        <!-- Vinyl Info -->
        <div class="p-4">
          <h3 class="text-lg font-medium text-gray-900 truncate">{{ vinyl.title }}</h3>
          <p class="text-sm text-gray-500">{{ vinyl.artist }}</p>
          <div class="mt-2 flex justify-between items-center">
            <span class="text-indigo-600 font-medium">{{ formatPrice(vinyl.price) }}</span>
            <span class="text-xs px-2 py-1 rounded-full" :class="{
              'bg-green-100 text-green-800': vinyl.condition === 'Mint' || vinyl.condition === 'Near Mint',
              'bg-blue-100 text-blue-800': vinyl.condition === 'Excellent' || vinyl.condition === 'Very Good Plus',
              'bg-yellow-100 text-yellow-800': vinyl.condition === 'Very Good' || vinyl.condition === 'Good',
              'bg-red-100 text-red-800': vinyl.condition === 'Fair' || vinyl.condition === 'Poor'
            }">
              {{ vinyl.condition }}
            </span>
          </div>
          <div class="mt-2 flex items-center text-sm text-gray-500">
            <p v-if="vinyl.genre">{{ vinyl.genre.name }}</p>
            <p v-if="vinyl.releaseYear" class="ml-auto">{{ vinyl.releaseYear }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
