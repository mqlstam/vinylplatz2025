<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { vinylService, Vinyl, VinylFilterParams, PaginatedResponse } from '../../services/vinyl.service';
import debounce from 'lodash/debounce';

// Components
import VinylFilter from '../../components/VinylFilter.vue';
import Pagination from '../../components/Pagination.vue';
import EmptyState from '../../components/EmptyState.vue';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

// Data
const vinyls = ref<Vinyl[]>([]);
const paginationData = ref({
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 0
});
const loading = ref(true);
const error = ref<string | null>(null);

// Filter state
const filters = ref<VinylFilterParams>({
  page: 1,
  limit: 12,
  sortBy: 'createdAt',
  sortOrder: 'DESC'
});

// Apply URL query params to filters on mount
const applyQueryParamsToFilters = () => {
  const query = route.query;

  // Page and limit
  if (query.page) filters.value.page = Number(query.page);
  if (query.limit) filters.value.limit = Number(query.limit);

  // Text search
  if (query.title) filters.value.title = query.title as string;
  if (query.artist) filters.value.artist = query.artist as string;

  // Selects
  if (query.genreId) filters.value.genreId = query.genreId as string;
  if (query.condition) filters.value.condition = query.condition as string;

  // Number ranges
  if (query.minPrice) filters.value.minPrice = Number(query.minPrice);
  if (query.maxPrice) filters.value.maxPrice = Number(query.maxPrice);
  if (query.releaseYear) filters.value.releaseYear = Number(query.releaseYear);

  // Sorting
  if (query.sortBy) filters.value.sortBy = query.sortBy as string;
  if (query.sortOrder) filters.value.sortOrder = query.sortOrder as 'ASC' | 'DESC';
};

// Update URL with current filters
const updateQueryParams = () => {
  // Filter out undefined/null/empty values and default pagination/sort
  const queryParams = Object.entries(filters.value)
    .filter(([key, value]) => {
      if (value === undefined || value === null || value === '') return false;
      if (key === 'page' && value === 1) return false;
      if (key === 'limit' && value === 12) return false;
      if (key === 'sortBy' && value === 'createdAt') return false;
      if (key === 'sortOrder' && value === 'DESC') return false;
      return true;
    })
    .reduce((acc, [key, value]) => {
      acc[key] = value.toString();
      return acc;
    }, {} as Record<string, string>);

  // Replace the current route with the new query params
  router.replace({
    path: route.path,
    query: queryParams
  });
};

// Load vinyls with current filters
const loadVinyls = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Get paginated vinyls with current filters
    const response = await vinylService.getAll(filters.value);

    // Update vinyls and pagination data
    vinyls.value = response.items;
    paginationData.value = {
      total: response.total,
      page: response.page,
      limit: response.limit,
      totalPages: response.totalPages
    };

    // Update URL query params
    updateQueryParams();
  } catch (err) {
    console.error('Error loading vinyls:', err);
    error.value = 'Failed to load vinyl listings. Please try again later.';
  } finally {
    loading.value = false;
  }
};

// Debounced search function to prevent too many API calls
const debouncedSearch = debounce(() => {
  // Reset to page 1 when search criteria change
  filters.value.page = 1;
  loadVinyls();
}, 300);

// Handle filter changes
const handleFilterUpdate = (newFilters: VinylFilterParams) => {
  filters.value = newFilters;
  // Trigger debounced search
  debouncedSearch();
};

// Apply filters immediately
const applyFilters = () => {
  filters.value.page = 1; // Reset page when applying
  loadVinyls();
};

// Reset all filters
const resetFilters = () => {
  filters.value = {
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  };
  loadVinyls();
};

// Handle page change
const handlePageChange = (page: number) => {
  filters.value.page = page;
  loadVinyls();
  // Scroll to top when changing page
  window.scrollTo({ top: 0, behavior: 'smooth' });
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

// Computed property to check if any filter is active
const hasActiveFilters = computed(() => {
  return Object.entries(filters.value).some(([key, value]) => {
    // Skip pagination and sorting parameters when determining if filters are active
    if (['page', 'limit', 'sortBy', 'sortOrder'].includes(key)) return false;
    if (key === 'sortBy' && value === 'createdAt') return false;
    if (key === 'sortOrder' && value === 'DESC') return false;
    return value !== undefined && value !== null && value !== '';
  });
});

// Computed property to check if authenticated
const isAuthenticated = computed(() => auth.isAuthenticated);

// Initialize component
onMounted(() => {
  // Apply any URL query params to filters
  applyQueryParamsToFilters();
  // Load vinyls with current filters
  loadVinyls();
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
        <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        List a Vinyl
      </button>
    </div>

    <!-- Filters -->
    <div class="mb-6">
      <VinylFilter
        v-model="filters"
        :loading="loading"
        @apply="applyFilters"
        @reset="resetFilters"
      />
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
    <EmptyState
      v-else-if="vinyls.length === 0"
      :hasFilters="hasActiveFilters"
      @reset-filters="resetFilters"
    />

    <!-- Vinyl Grid -->
    <div v-else>
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div
          v-for="vinyl in vinyls"
          :key="vinyl.id"
          class="bg-white overflow-hidden shadow rounded-lg cursor-pointer transition-shadow hover:shadow-md flex flex-col"
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
          <div class="p-4 flex-grow flex flex-col">
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
            <div class="mt-2 flex items-center text-sm text-gray-500 flex-grow">
              <p v-if="vinyl.genre" class="truncate">{{ vinyl.genre.name }}</p>
              <p v-if="vinyl.releaseYear" class="ml-auto flex-shrink-0">{{ vinyl.releaseYear }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <Pagination
        v-if="paginationData.totalPages > 1"
        :current-page="paginationData.page"
        :total-pages="paginationData.totalPages"
        :total-items="paginationData.total"
        :loading="loading"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>
