<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { genreService, Genre } from '../services/genre.service';
import { VinylFilterParams } from '../services/vinyl.service';

// Props
const props = defineProps<{
  modelValue: VinylFilterParams;
  loading?: boolean;
}>();

// Emits
const emit = defineEmits(['update:modelValue', 'apply', 'reset']);

// Data
const genres = ref<Genre[]>([]);
const genresLoading = ref(false);
const showAdvancedFilters = ref(false);

// Local form state
const localFilters = ref({ ...props.modelValue });

// Vinyl conditions
const conditions = [
  'Mint',
  'Near Mint',
  'Excellent',
  'Very Good Plus', 
  'Very Good',
  'Good',
  'Fair',
  'Poor'
];

// Sort options
const sortOptions = [
  { value: 'createdAt', label: 'Most Recent' },
  { value: 'price', label: 'Price (Low to High)', order: 'ASC' },
  { value: 'price', label: 'Price (High to Low)', order: 'DESC' },
  { value: 'title', label: 'Title (A-Z)', order: 'ASC' },
  { value: 'title', label: 'Title (Z-A)', order: 'DESC' },
  { value: 'releaseYear', label: 'Release Year (Newest)', order: 'DESC' },
  { value: 'releaseYear', label: 'Release Year (Oldest)', order: 'ASC' },
];

// Current sort option
const currentSort = ref(sortOptions[0]);

// Years range for the dropdown
const releaseYears = computed(() => {
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= 1900; year--) {
    years.push(year);
  }
  return years;
});

// Computed to check if any filter is active
const hasActiveFilters = computed(() => {
  return Object.entries(localFilters.value).some(([key, value]) => {
    // Skip pagination and sorting parameters when determining if filters are active
    if (['page', 'limit', 'sortBy', 'sortOrder'].includes(key)) return false;
    return value !== undefined && value !== null && value !== '';
  });
});

// Handle input changes
const updateFilter = (key: keyof VinylFilterParams, value: any) => {
  // Handle empty strings as undefined
  localFilters.value[key] = value === '' ? undefined : value;
  emit('update:modelValue', { ...localFilters.value });
};

// Apply filters
const applyFilters = () => {
  // Reset to page 1 when applying filters
  localFilters.value.page = 1;
  emit('update:modelValue', { ...localFilters.value });
  emit('apply');
};

// Reset filters
const resetFilters = () => {
  // Keep pagination and sorting but reset other filters
  const { page, limit, sortBy, sortOrder } = localFilters.value;
  localFilters.value = {
    page: 1, // Reset to page 1 when clearing filters
    limit,
    sortBy,
    sortOrder
  };
  
  // Reset sort to default
  currentSort.value = sortOptions[0];
  
  emit('update:modelValue', { ...localFilters.value });
  emit('reset');
};

// Toggle advanced filters
const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value;
};

// Handle sort selection
const handleSortChange = (option: { value: string, label: string, order?: 'ASC' | 'DESC' }) => {
  currentSort.value = option;
  localFilters.value.sortBy = option.value;
  localFilters.value.sortOrder = option.order || 'DESC';
  emit('update:modelValue', { ...localFilters.value });
  emit('apply');
};

// Fetch genres
const loadGenres = async () => {
  genresLoading.value = true;
  
  try {
    genres.value = await genreService.getAll();
  } catch (err) {
    console.error('Error loading genres for filter:', err);
  } finally {
    genresLoading.value = false;
  }
};

// Watch for external changes to the modelValue
watch(() => props.modelValue, (newValue) => {
  localFilters.value = { ...newValue };
  
  // Update currentSort based on sortBy and sortOrder
  if (newValue.sortBy && newValue.sortOrder) {
    const matchingOption = sortOptions.find(option => 
      option.value === newValue.sortBy && option.order === newValue.sortOrder
    );
    
    if (matchingOption) {
      currentSort.value = matchingOption;
    }
  }
}, { deep: true });

// Initialize
onMounted(() => {
  loadGenres();
});
</script>

<template>
  <div class="vinyl-filter">
    <!-- Search and basic filters -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <!-- Title search -->
      <div>
        <label for="title-search" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <div class="relative rounded-md shadow-sm">
          <input
            id="title-search"
            type="text"
            :value="localFilters.title"
            @input="updateFilter('title', ($event.target as HTMLInputElement).value)"
            placeholder="Search by title"
            class="block w-full pr-10 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <div v-if="localFilters.title" 
               class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
               @click="updateFilter('title', '')">
            <span class="text-gray-500 sm:text-sm">×</span>
          </div>
        </div>
      </div>
      
      <!-- Artist search -->
      <div>
        <label for="artist-search" class="block text-sm font-medium text-gray-700 mb-1">Artist</label>
        <div class="relative rounded-md shadow-sm">
          <input
            id="artist-search"
            type="text"
            :value="localFilters.artist"
            @input="updateFilter('artist', ($event.target as HTMLInputElement).value)"
            placeholder="Search by artist"
            class="block w-full pr-10 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <div v-if="localFilters.artist" 
               class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
               @click="updateFilter('artist', '')">
            <span class="text-gray-500 sm:text-sm">×</span>
          </div>
        </div>
      </div>
      
      <!-- Genre filter -->
      <div>
        <label for="genre-filter" class="block text-sm font-medium text-gray-700 mb-1">Genre</label>
        <select
          id="genre-filter"
          :value="localFilters.genreId"
          @change="updateFilter('genreId', ($event.target as HTMLSelectElement).value)"
          class="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">All Genres</option>
          <option v-if="genresLoading" value="" disabled>Loading genres...</option>
          <option v-for="genre in genres" :key="genre.id" :value="genre.id">{{ genre.name }}</option>
        </select>
      </div>
      
      <!-- Sort by -->
      <div>
        <label for="sort-by" class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
        <select
          id="sort-by"
          :value="currentSort.label"
          @change="handleSortChange(sortOptions[$event.target.selectedIndex])"
          class="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option v-for="option in sortOptions" :key="option.label" :value="option.label">{{ option.label }}</option>
        </select>
      </div>
    </div>
    
    <!-- Advanced filters toggle -->
    <div class="flex items-center justify-between mb-4">
      <button 
        type="button" 
        @click="toggleAdvancedFilters"
        class="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
      >
        <span>{{ showAdvancedFilters ? 'Hide' : 'Show' }} Advanced Filters</span>
        <svg 
          class="ml-1 h-5 w-5" 
          :class="{ 'transform rotate-180': showAdvancedFilters }"
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
      
      <div class="flex space-x-3">
        <button 
          v-if="hasActiveFilters"
          type="button" 
          @click="resetFilters"
          class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          :disabled="props.loading"
        >
          <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
          </svg>
          Reset Filters
        </button>
        
        <button 
          type="button" 
          @click="applyFilters"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          :disabled="props.loading"
        >
          <span v-if="props.loading">Applying...</span>
          <span v-else>Apply Filters</span>
        </button>
      </div>
    </div>
    
    <!-- Advanced filters panel -->
    <div v-if="showAdvancedFilters" class="bg-gray-50 p-4 rounded-md mb-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Price range -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Price Range ($)</label>
          <div class="flex space-x-2">
            <div class="w-1/2">
              <input
                type="number"
                :value="localFilters.minPrice"
                @input="updateFilter('minPrice', Number(($event.target as HTMLInputElement).value) || undefined)"
                placeholder="Min"
                min="0"
                class="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div class="w-1/2">
              <input
                type="number"
                :value="localFilters.maxPrice"
                @input="updateFilter('maxPrice', Number(($event.target as HTMLInputElement).value) || undefined)"
                placeholder="Max"
                min="0"
                class="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
        
        <!-- Condition filter -->
        <div>
          <label for="condition-filter" class="block text-sm font-medium text-gray-700 mb-1">Condition</label>
          <select
            id="condition-filter"
            :value="localFilters.condition"
            @change="updateFilter('condition', ($event.target as HTMLSelectElement).value)"
            class="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Any Condition</option>
            <option v-for="condition in conditions" :key="condition" :value="condition">{{ condition }}</option>
          </select>
        </div>
        
        <!-- Release year -->
        <div>
          <label for="release-year" class="block text-sm font-medium text-gray-700 mb-1">Release Year</label>
          <select
            id="release-year"
            :value="localFilters.releaseYear"
            @change="updateFilter('releaseYear', Number(($event.target as HTMLSelectElement).value) || undefined)"
            class="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Any Year</option>
            <option v-for="year in releaseYears" :key="year" :value="year">{{ year }}</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Active filters summary -->
    <div v-if="hasActiveFilters" class="flex flex-wrap items-center gap-2 mb-4">
      <span class="text-sm font-medium text-gray-700">Active Filters:</span>
      
      <!-- Title filter -->
      <div v-if="localFilters.title" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
        Title: {{ localFilters.title }}
        <button type="button" @click="updateFilter('title', '')" class="ml-1 inline-flex text-indigo-500 focus:outline-none">
          <span class="sr-only">Remove filter</span>
          <svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      
      <!-- Artist filter -->
      <div v-if="localFilters.artist" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
        Artist: {{ localFilters.artist }}
        <button type="button" @click="updateFilter('artist', '')" class="ml-1 inline-flex text-indigo-500 focus:outline-none">
          <span class="sr-only">Remove filter</span>
          <svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      
      <!-- Genre filter -->
      <div v-if="localFilters.genreId" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
        Genre: {{ genres.find(g => g.id === localFilters.genreId)?.name || 'Unknown' }}
        <button type="button" @click="updateFilter('genreId', '')" class="ml-1 inline-flex text-indigo-500 focus:outline-none">
          <span class="sr-only">Remove filter</span>
          <svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      
      <!-- Condition filter -->
      <div v-if="localFilters.condition" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
        Condition: {{ localFilters.condition }}
        <button type="button" @click="updateFilter('condition', '')" class="ml-1 inline-flex text-indigo-500 focus:outline-none">
          <span class="sr-only">Remove filter</span>
          <svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      
      <!-- Price range -->
      <div v-if="localFilters.minPrice !== undefined || localFilters.maxPrice !== undefined" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
        Price: {{ localFilters.minPrice !== undefined ? '$' + localFilters.minPrice : '$0' }} - {{ localFilters.maxPrice !== undefined ? '$' + localFilters.maxPrice : 'Any' }}
        <button type="button" @click="() => { updateFilter('minPrice', undefined); updateFilter('maxPrice', undefined); }" class="ml-1 inline-flex text-indigo-500 focus:outline-none">
          <span class="sr-only">Remove filter</span>
          <svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      
      <!-- Release year -->
      <div v-if="localFilters.releaseYear" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
        Year: {{ localFilters.releaseYear }}
        <button type="button" @click="updateFilter('releaseYear', undefined)" class="ml-1 inline-flex text-indigo-500 focus:outline-none">
          <span class="sr-only">Remove filter</span>
          <svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
