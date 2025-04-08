<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { vinylService, Vinyl, VinylFilter } from '../../services/vinyl.service';
import { genreService, Genre } from '../../services/genre.service';

const router = useRouter();
const auth = useAuthStore();

// Data
const vinyls = ref<Vinyl[]>([]);
const genres = ref<Genre[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Filter state
const filters = ref<VinylFilter>({});
const showFilters = ref(false);
const minPrice = ref<number | null>(null);
const maxPrice = ref<number | null>(null);

// Computed properties
const isAuthenticated = computed(() => auth.isAuthenticated);

// Load data
const loadVinyls = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // Apply min/max price to filters if set
    if (minPrice.value !== null) {
      filters.value.minPrice = minPrice.value;
    } else {
      delete filters.value.minPrice;
    }
    
    if (maxPrice.value !== null) {
      filters.value.maxPrice = maxPrice.value;
    } else {
      delete filters.value.maxPrice;
    }
    
    vinyls.value = await vinylService.getAll(filters.value);
  } catch (err) {
    console.error('Error loading vinyls:', err);
    error.value = 'Failed to load vinyl listings. Please try again later.';
  } finally {
    loading.value = false;
  }
};

const loadGenres = async () => {
  try {
    genres.value = await genreService.getAll();
  } catch (err) {
    console.error('Error loading genres:', err);
  }
};

// Reset filters
const resetFilters = () => {
  filters.value = {};
  minPrice.value = null;
  maxPrice.value = null;
  loadVinyls();
};

// View vinyl details
const viewVinyl = (id: string) => {
  router.push(`/vinyls/${id}`);
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

// Watch for filter changes
watch([() => filters.value.genreId, () => filters.value.condition], () => {
  loadVinyls();
});

// Lifecycle hooks
onMounted(() => {
  loadVinyls();
  loadGenres();
});
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <h1 class="text-3xl font-bold mb-4 sm:mb-0">Vinyl Records</h1>
      
      <div class="flex flex-col sm:flex-row gap-4">
        <button 
          @click="showFilters = !showFilters" 
          class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span v-if="!showFilters">Show Filters</span>
          <span v-else>Hide Filters</span>
        </button>
        
        <button 
          v-if="isAuthenticated"
          @click="createVinyl" 
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          List a Vinyl
        </button>
      </div>
    </div>
    
    <!-- Filters -->
    <div v-if="showFilters" class="bg-white shadow rounded-lg mb-6 p-4">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Title Filter -->
        <div>
          <label for="title-filter" class="block text-sm font-medium text-gray-700">Title</label>
          <input
            id="title-filter"
            v-model="filters.title"
            type="text"
            placeholder="Search by title"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            @keyup.enter="loadVinyls"
          />
        </div>
        
        <!-- Artist Filter -->
        <div>
          <label for="artist-filter" class="block text-sm font-medium text-gray-700">Artist</label>
          <input
            id="artist-filter"
            v-model="filters.artist"
            type="text"
            placeholder="Search by artist"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            @keyup.enter="loadVinyls"
          />
        </div>
        
        <!-- Genre Filter -->
        <div>
          <label for="genre-filter" class="block text-sm font-medium text-gray-700">Genre</label>
          <select
            id="genre-filter"
            v-model="filters.genreId"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">All Genres</option>
            <option v-for="genre in genres" :key="genre.id" :value="genre.id">{{ genre.name }}</option>
          </select>
        </div>
        
        <!-- Condition Filter -->
        <div>
          <label for="condition-filter" class="block text-sm font-medium text-gray-700">Condition</label>
          <select
            id="condition-filter"
            v-model="filters.condition"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">All Conditions</option>
            <option value="Mint">Mint</option>
            <option value="Near Mint">Near Mint</option>
            <option value="Excellent">Excellent</option>
            <option value="Very Good Plus">Very Good Plus</option>
            <option value="Very Good">Very Good</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
          </select>
        </div>
        
        <!-- Price Range Filters -->
        <div>
          <label for="min-price" class="block text-sm font-medium text-gray-700">Min Price</label>
          <input
            id="min-price"
            v-model.number="minPrice"
            type="number"
            min="0"
            placeholder="Min Price"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label for="max-price" class="block text-sm font-medium text-gray-700">Max Price</label>
          <input
            id="max-price"
            v-model.number="maxPrice"
            type="number"
            min="0"
            placeholder="Max Price"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>
      
      <!-- Filter Actions -->
      <div class="mt-4 flex justify-end space-x-3">
        <button
          @click="resetFilters"
          class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Reset
        </button>
        <button
          @click="loadVinyls"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Apply Filters
        </button>
      </div>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="text-center py-12">
      <p class="text-xl text-gray-600">Loading vinyl records...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 p-4 rounded-md">
      <p class="text-red-800">{{ error }}</p>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="vinyls.length === 0" class="text-center py-12">
      <p class="text-xl text-gray-600">
        No vinyl records found.
        <span v-if="Object.keys(filters).length > 0 || minPrice !== null || maxPrice !== null">
          Try changing your filters.
        </span>
      </p>
    </div>
    
    <!-- Vinyl Grid -->
    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div 
        v-for="vinyl in vinyls" 
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
          <div class="mt-2 flex items-center text-sm text-gray-500">
            <p v-if="vinyl.genre">{{ vinyl.genre.name }}</p>
            <p v-if="vinyl.releaseYear" class="ml-auto">{{ vinyl.releaseYear }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
