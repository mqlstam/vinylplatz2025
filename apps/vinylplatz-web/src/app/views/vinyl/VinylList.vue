<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { vinylService, Vinyl, VinylFilterParams, PaginatedResponse } from '../../services/vinyl.service';
import VinylFilter from '../../components/VinylFilter.vue';
import Pagination from '../../components/Pagination.vue';
import { debounce } from 'lodash';

const router = useRouter();
const auth = useAuthStore();

// Data
const vinyls = ref<Vinyl[]>([]);
const totalItems = ref(0);
const totalPages = ref(0);
const loading = ref(true);
const error = ref<string | null>(null);

// Filters and pagination state
const filters = ref<VinylFilterParams>({
  page: 1,
  limit: 12,
  sortBy: 'createdAt',
  sortOrder: 'DESC'
});

// Computed properties
const isAuthenticated = computed(() => auth.isAuthenticated);
const hasResults = computed(() => vinyls.value.length > 0);
const hasFilters = computed(() => {
  const { page, limit, sortBy, sortOrder, ...activeFilters } = filters.value;
  return Object.values(activeFilters).some(value => 
    value !== undefined && value !== null && value !== ''
  );
});

// Debounced filter function
const debouncedFilter = debounce(() => {
  loadVinyls();
}, 300);

// Load vinyls with filters
const loadVinyls = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await vinylService.getAll(filters.value);
    vinyls.value = response.items;
    totalItems.value = response.total;
    totalPages.value = response.totalPages;
    
    // If current page is out of bounds, reset to page 1
    if (filters.value.page && response.totalPages > 0 && filters.value.page > response.totalPages) {
      filters.value.page = 1;
      await loadVinyls();
    }
  } catch (err) {
    console.error('Error loading vinyls:', err);
    error.value = 'Failed to load vinyl listings. Please try again later.';
    vinyls.value = [];
    totalItems.value = 0;
    totalPages.value = 0;
  } finally {
    loading.value = false;
  }
};

// Handle page change
const handlePageChange = (page: number) => {
  filters.value.page = page;
  loadVinyls();
  
  // Scroll to top of the page for better UX
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Handle filter changes
const handleFilterChange = (updatedFilters: VinylFilterParams) => {
  filters.value = { ...updatedFilters };
  
  // Reset to page 1 when filters change
  filters.value.page = 1;
};

// Apply filters (triggered by the filter component)
const applyFilters = () => {
  loadVinyls();
};

// Reset filters (triggered by the filter component)
const resetFilters = () => {
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

// Watch for URL query parameters
const updateFiltersFromQuery = () => {
  const query = router.currentRoute.value.query;
  const newFilters: VinylFilterParams = { ...filters.value };
  
  // Map query parameters to filter properties
  if (query.title) newFilters.title = query.title as string;
  if (query.artist) newFilters.artist = query.artist as string;
  if (query.genreId) newFilters.genreId = query.genreId as string;
  if (query.condition) newFilters.condition = query.condition as string;
  if (query.minPrice) newFilters.minPrice = Number(query.minPrice);
  if (query.maxPrice) newFilters.maxPrice = Number(query.maxPrice);
  if (query.releaseYear) newFilters.releaseYear = Number(query.releaseYear);
  if (query.page) newFilters.page = Number(query.page);
  
  // Update filters
  filters.value = newFilters;
  
  // Load vinyls with the new filters
  loadVinyls();
};

// Update URL query parameters based on filters
const updateQueryFromFilters = () => {
  const query: Record<string, string> = {};
  const { page, limit, sortBy, sortOrder, ...activeFilters } = filters.value;
  
  // Only add filters that are not empty
  Object.entries(activeFilters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query[key] = String(value);
    }
  });
  
  // Add pagination
  if (page !== 1) query.page = String(page);
  
  // Replace URL without reloading the page
  router.replace({ 
    query
  });
};

// Watch for filter changes to update URL
watch(() => filters.value, () => {
  updateQueryFromFilters();
}, { deep: true });

// Lifecycle hooks
onMounted(() => {
  // Check if there are URL parameters to apply
  if (Object.keys(router.currentRoute.value.query).length > 0) {
    updateFiltersFromQuery();
  } else {
    loadVinyls();
  }
});
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <h1 class="text-3xl font-bold mb-4 sm:mb-0">Vinyl Records</h1>
      
      <button 
        v-if="isAuthenticated"
        @click="createVinyl" 
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        List a Vinyl
      </button>
    </div>
    
    <!-- Filter Component -->
    <VinylFilter 
      v-model="filters"
      :loading="loading"
      @apply="applyFilters"
      @reset="resetFilters"
    />
    
    <!-- Loading state -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <p class="mt-2 text-gray-600">Loading vinyl records...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 p-4 rounded-md">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 001.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-800">{{ error }}</p>
        </div>
      </div>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="!hasResults" class="text-center py-12 bg-white shadow rounded-lg">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No records found</h3>
      <p class="mt-1 text-sm text-gray-500">
        <span v-if="hasFilters">
          No vinyl records match your current filters. Try changing your search criteria.
        </span>
        <span v-else>
          There are no vinyl records available at the moment.
        </span>
      </p>
      <div class="mt-6" v-if="hasFilters">
        <button
          @click="resetFilters"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Clear filters
        </button>
      </div>
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
    
    <!-- Pagination -->
    <Pagination 
      v-if="totalPages > 1"
      :current-page="filters.page || 1"
      :total-pages="totalPages"
      :total-items="totalItems"
      :loading="loading"
      @page-change="handlePageChange"
    />
  </div>
</template>
