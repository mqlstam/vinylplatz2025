<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { vinylService, Vinyl } from '../../services/vinyl.service';

const router = useRouter();
const auth = useAuthStore();

// Data
const vinyls = ref<Vinyl[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Load data
// Inside apps/vinylplatz-web/src/app/views/vinyl/MyVinylListings.vue

const loadMyVinyls = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // FIX: Change getMyListings to getMyVinyls
    vinyls.value = await vinylService.getMyVinyls(); 
  } catch (err: any) { // Add type annotation for better error handling
    console.error('Error loading my vinyl listings:', err);
    error.value = 'Failed to load your vinyl listings. Please try again later.';
  } finally {
    loading.value = false;
  }
};

// View vinyl details
const viewVinyl = (id: string) => {
  router.push(`/vinyls/${id}`);
};

// Edit vinyl
const editVinyl = (id: string, event: Event) => {
  event.stopPropagation(); // Prevent triggering the parent click
  router.push(`/vinyls/edit/${id}`);
};

// Create new vinyl listing
const createVinyl = () => {
  router.push('/vinyls/new');
};

// Format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

// Lifecycle hooks
onMounted(() => {
  // Redirect if not authenticated
  if (!auth.isAuthenticated) {
    router.push('/login');
    return;
  }
  
  loadMyVinyls();
});
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <h1 class="text-3xl font-bold mb-4 sm:mb-0">My Vinyl Listings</h1>
      
      <button 
        @click="createVinyl" 
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        List a New Vinyl
      </button>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="text-center py-12">
      <p class="text-xl text-gray-600">Loading your listings...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 p-4 rounded-md">
      <p class="text-red-800">{{ error }}</p>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="vinyls.length === 0" class="text-center py-12 bg-white shadow rounded-lg">
      <h3 class="text-lg font-medium text-gray-900 mb-2">No vinyl listings yet</h3>
      <p class="text-gray-600 mb-6">You haven't listed any vinyl records for sale yet.</p>
      <button 
        @click="createVinyl" 
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Create Your First Listing
      </button>
    </div>
    
    <!-- Vinyl List -->
    <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
      <ul class="divide-y divide-gray-200">
        <li 
          v-for="vinyl in vinyls" 
          :key="vinyl.id" 
          class="block hover:bg-gray-50 cursor-pointer"
          @click="viewVinyl(vinyl.id)"
        >
          <div class="flex items-center px-4 py-4 sm:px-6">
            <!-- Vinyl Cover -->
            <div class="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-md overflow-hidden">
              <img 
                v-if="vinyl.coverImageUrl" 
                :src="vinyl.coverImageUrl" 
                :alt="vinyl.title" 
                class="h-full w-full object-cover"
              />
              <div v-else class="h-full w-full flex items-center justify-center bg-gray-100">
                <svg class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </div>
            </div>
            
            <!-- Vinyl Info -->
            <div class="ml-4 flex-1 min-w-0">
              <div>
                <h3 class="text-lg font-medium text-gray-900 truncate">{{ vinyl.title }}</h3>
                <p class="text-sm text-gray-500">{{ vinyl.artist }}</p>
              </div>
              <div class="mt-2 sm:flex sm:justify-between">
                <div class="flex items-center text-sm text-gray-500">
                  <span
                    class="px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-800': vinyl.condition === 'Mint' || vinyl.condition === 'Near Mint',
                      'bg-blue-100 text-blue-800': vinyl.condition === 'Excellent' || vinyl.condition === 'Very Good Plus',
                      'bg-yellow-100 text-yellow-800': vinyl.condition === 'Very Good' || vinyl.condition === 'Good',
                      'bg-red-100 text-red-800': vinyl.condition === 'Fair' || vinyl.condition === 'Poor'
                    }"
                  >
                    {{ vinyl.condition }}
                  </span>
                  <span v-if="vinyl.genre" class="ml-2">{{ vinyl.genre.name }}</span>
                </div>
                <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  <span class="font-medium text-indigo-600">{{ formatPrice(vinyl.price) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="ml-5 flex-shrink-0">
              <button
                @click="editVinyl(vinyl.id, $event)"
                class="p-1.5 rounded-md text-indigo-600 hover:bg-indigo-50"
              >
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
