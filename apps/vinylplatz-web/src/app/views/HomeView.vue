<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { vinylService, Vinyl } from '../services/vinyl.service';

const router = useRouter();
const auth = useAuthStore();

// Data
const recentVinyls = ref<Vinyl[]>([]);
const loading = ref(true);


const loadRecentVinyls = async () => {
  try {
    loading.value = true; // Start loading
    const response = await vinylService.getAll({ // Fetch page 1 with default limit
      page: 1, 
      limit: 4, // Only fetch 4 items initially
      sortBy: 'createdAt', 
      sortOrder: 'DESC' 
    }); 
    // *** FIX HERE: Access the 'items' array from the response ***
    recentVinyls.value = response.items; // Slice is already handled by limit
  } catch (err) {
    console.error('Error loading recent vinyls:', err);
    // Optionally set an error state here
  } finally {
    loading.value = false; // Stop loading
  }
};

// Format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

// View vinyl details
const viewVinyl = (id: string) => {
  router.push(`/vinyls/${id}`);
};

// Computed property to check if user is authenticated
const isAuthenticated = computed(() => auth.isAuthenticated);

// Navigate to vinyl listings
const browseVinyls = () => {
  router.push('/vinyls');
};

// Navigate to add vinyl form
const sellVinyl = () => {
  router.push('/vinyls/new');
};

// On component mount
onMounted(() => {
  loadRecentVinyls();
});
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <!-- Hero Section -->
    <div class="bg-indigo-700 rounded-lg shadow-lg overflow-hidden">
      <div class="px-6 py-12 sm:px-12 lg:px-16 lg:py-24">
        <div class="max-w-2xl mx-auto text-center">
          <h2 class="text-3xl font-extrabold text-white sm:text-4xl">
            <span class="block">Welcome to VinylPlatz</span>
            <span class="block">The Vinyl Marketplace</span>
          </h2>
          <p class="mt-4 text-lg leading-6 text-indigo-100">
            Buy and sell vinyl records from collectors around the world. Find that rare album you've been searching for or sell your collection to fellow enthusiasts.
          </p>
          <div class="mt-8 flex justify-center space-x-4">
            <button 
              @click="browseVinyls"
              class="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-600 bg-white hover:bg-indigo-50 sm:px-8"
            >
              Browse Records
            </button>
            <button 
              v-if="isAuthenticated"
              @click="sellVinyl"
              class="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-500 hover:bg-indigo-600 sm:px-8"
            >
              Sell Your Vinyl
            </button>
            <router-link 
              v-else
              to="/login"
              class="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-500 hover:bg-indigo-600 sm:px-8"
            >
              Sign In to Sell
            </router-link>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Recent Listings Section -->
    <div class="mt-12">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Recent Listings</h2>
        <router-link to="/vinyls" class="text-indigo-600 hover:text-indigo-500">
          View all <span aria-hidden="true">&rarr;</span>
        </router-link>
      </div>
      
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-600">Loading recent vinyl listings...</p>
      </div>
      
      <div v-else-if="recentVinyls.length === 0" class="text-center py-12 bg-white shadow rounded-lg">
        <p class="text-gray-600">No vinyl listings available yet. Be the first to list a vinyl!</p>
      </div>
      
      <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div 
          v-for="vinyl in recentVinyls" 
          :key="vinyl.id" 
          class="bg-white overflow-hidden shadow rounded-lg cursor-pointer transition-shadow hover:shadow-md"
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
          </div>
        </div>
      </div>
    </div>
    
    <!-- Features Section -->
    <div class="mt-12 bg-white shadow rounded-lg overflow-hidden">
      <div class="px-6 py-8 sm:p-10">
        <h2 class="text-2xl font-bold text-gray-900 text-center mb-8">Why VinylPlatz?</h2>
        
        <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-medium text-gray-900">Fast & Simple</h3>
            <p class="mt-2 text-base text-gray-500">
              List your vinyl records in minutes with our easy-to-use platform.
            </p>
          </div>
          
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-medium text-gray-900">Secure Transactions</h3>
            <p class="mt-2 text-base text-gray-500">
              Your transactions are protected with our secure marketplace.
            </p>
          </div>
          
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-medium text-gray-900">Community</h3>
            <p class="mt-2 text-base text-gray-500">
              Connect with a community of vinyl enthusiasts and collectors.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
