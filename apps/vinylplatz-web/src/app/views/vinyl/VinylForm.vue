<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { vinylService, CreateVinylDto, UpdateVinylDto, Vinyl } from '../../services/vinyl.service';
import { genreService, Genre } from '../../services/genre.service';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

// Determine if we're editing or creating
const isEditing = computed(() => route.name === 'edit-vinyl');
const vinylId = computed(() => isEditing.value ? route.params.id as string : null);

// Form data
const formData = ref<CreateVinylDto | UpdateVinylDto>({
  title: '',
  artist: '',
  releaseYear: undefined,
  condition: 'Very Good',
  price: 0,
  description: '',
  coverImageUrl: '',
  genreId: undefined
});

// Form state
const genres = ref<Genre[]>([]);
const loading = ref(false);
const initialLoading = ref(true);
const error = ref<string | null>(null);
const success = ref<string | null>(null);
const formErrors = ref<Record<string, string>>({});

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

// Load genres
const loadGenres = async () => {
  try {
    genres.value = await genreService.getAll();
  } catch (err) {
    console.error('Error loading genres:', err);
  }
};

// Load vinyl for editing
const loadVinyl = async () => {
  if (!isEditing.value || !vinylId.value) {
    initialLoading.value = false;
    return;
  }
  
  try {
    const vinyl = await vinylService.getById(vinylId.value);
    
    // Check if user is the owner
    if (auth.user && vinyl.sellerId !== auth.user.id) {
      error.value = 'You do not have permission to edit this vinyl listing';
      router.push(`/vinyls/${vinylId.value}`);
      return;
    }
    
    // Populate form data
    formData.value = {
      title: vinyl.title,
      artist: vinyl.artist,
      releaseYear: vinyl.releaseYear,
      condition: vinyl.condition,
      price: vinyl.price,
      description: vinyl.description,
      coverImageUrl: vinyl.coverImageUrl,
      genreId: vinyl.genreId
    };
  } catch (err) {
    console.error('Error loading vinyl for editing:', err);
    error.value = 'Failed to load vinyl details. Please try again later.';
  } finally {
    initialLoading.value = false;
  }
};

// Form validation
const validateForm = () => {
  const errors: Record<string, string> = {};
  
  if (!formData.value.title?.trim()) {
    errors.title = 'Title is required';
  }
  
  if (!formData.value.artist?.trim()) {
    errors.artist = 'Artist is required';
  }
  
  if (formData.value.releaseYear !== undefined) {
    const currentYear = new Date().getFullYear();
    if (formData.value.releaseYear < 1900 || formData.value.releaseYear > currentYear) {
      errors.releaseYear = `Release year must be between 1900 and ${currentYear}`;
    }
  }
  
  if (formData.value.price === undefined || formData.value.price < 0) {
    errors.price = 'Price must be a positive number';
  }
  
  if (!formData.value.condition) {
    errors.condition = 'Condition is required';
  }
  
  formErrors.value = errors;
  return Object.keys(errors).length === 0;
};

// Submit form
const handleSubmit = async () => {
  // Validate form
  if (!validateForm()) {
    return;
  }
  
  loading.value = true;
  error.value = null;
  success.value = null;
  
  try {
    if (isEditing.value && vinylId.value) {
      // Update existing vinyl
      await vinylService.update(vinylId.value, formData.value as UpdateVinylDto);
      success.value = 'Vinyl listing updated successfully';
    } else {
      // Create new vinyl
      const newVinyl = await vinylService.create(formData.value as CreateVinylDto);
      success.value = 'Vinyl listing created successfully';
      
      // Redirect to the new vinyl after a short delay
      setTimeout(() => {
        router.push(`/vinyls/${newVinyl.id}`);
      }, 1500);
    }
  } catch (err: any) {
    console.error('Error saving vinyl:', err);
    error.value = err.response?.data?.message || 'An error occurred while saving. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Cancel form
const handleCancel = () => {
  if (isEditing.value && vinylId.value) {
    router.push(`/vinyls/${vinylId.value}`);
  } else {
    router.push('/vinyls');
  }
};

// Lifecyle hooks
onMounted(() => {
  // Redirect if not authenticated
  if (!auth.isAuthenticated) {
    router.push('/login');
    return;
  }
  
  loadGenres();
  loadVinyl();
});
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <h1 class="text-3xl font-bold mb-6">
      {{ isEditing ? 'Edit Vinyl Listing' : 'Create New Vinyl Listing' }}
    </h1>
    
    <!-- Loading state -->
    <div v-if="initialLoading" class="text-center py-12">
      <p class="text-xl text-gray-600">Loading...</p>
    </div>
    
    <div v-else>
      <!-- Success message -->
      <div v-if="success" class="mb-6 bg-green-50 p-4 rounded-md border border-green-200">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-green-800">
              {{ success }}
            </p>
          </div>
        </div>
      </div>
      
      <!-- Error message -->
      <div v-if="error" class="mb-6 bg-red-50 p-4 rounded-md border border-red-200">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-red-800">
              {{ error }}
            </p>
          </div>
        </div>
      </div>
      
      <!-- Form -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
          <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <!-- Title -->
            <div class="sm:col-span-3">
              <label for="title" class="block text-sm font-medium text-gray-700">Title *</label>
              <div class="mt-1">
                <input
                  id="title"
                  v-model="formData.title"
                  type="text"
                  required
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                <p v-if="formErrors.title" class="mt-1 text-sm text-red-600">{{ formErrors.title }}</p>
              </div>
            </div>
            
            <!-- Artist -->
            <div class="sm:col-span-3">
              <label for="artist" class="block text-sm font-medium text-gray-700">Artist *</label>
              <div class="mt-1">
                <input
                  id="artist"
                  v-model="formData.artist"
                  type="text"
                  required
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                <p v-if="formErrors.artist" class="mt-1 text-sm text-red-600">{{ formErrors.artist }}</p>
              </div>
            </div>
            
            <!-- Release Year -->
            <div class="sm:col-span-2">
              <label for="releaseYear" class="block text-sm font-medium text-gray-700">Release Year</label>
              <div class="mt-1">
                <input
                  id="releaseYear"
                  v-model.number="formData.releaseYear"
                  type="number"
                  min="1900"
                  :max="new Date().getFullYear()"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                <p v-if="formErrors.releaseYear" class="mt-1 text-sm text-red-600">{{ formErrors.releaseYear }}</p>
              </div>
            </div>
            
            <!-- Condition -->
            <div class="sm:col-span-2">
              <label for="condition" class="block text-sm font-medium text-gray-700">Condition *</label>
              <div class="mt-1">
                <select
                  id="condition"
                  v-model="formData.condition"
                  required
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option v-for="condition in conditions" :key="condition" :value="condition">
                    {{ condition }}
                  </option>
                </select>
                <p v-if="formErrors.condition" class="mt-1 text-sm text-red-600">{{ formErrors.condition }}</p>
              </div>
            </div>
            
            <!-- Price -->
            <div class="sm:col-span-2">
              <label for="price" class="block text-sm font-medium text-gray-700">Price *</label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  id="price"
                  v-model.number="formData.price"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                />
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span class="text-gray-500 sm:text-sm">USD</span>
                </div>
              </div>
              <p v-if="formErrors.price" class="mt-1 text-sm text-red-600">{{ formErrors.price }}</p>
            </div>
            
            <!-- Genre -->
            <div class="sm:col-span-3">
              <label for="genreId" class="block text-sm font-medium text-gray-700">Genre</label>
              <div class="mt-1">
                <select
                  id="genreId"
                  v-model="formData.genreId"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Select a genre</option>
                  <option v-for="genre in genres" :key="genre.id" :value="genre.id">
                    {{ genre.name }}
                  </option>
                </select>
              </div>
            </div>
            
            <!-- Cover Image URL -->
            <div class="sm:col-span-3">
              <label for="coverImageUrl" class="block text-sm font-medium text-gray-700">Cover Image URL</label>
              <div class="mt-1">
                <input
                  id="coverImageUrl"
                  v-model="formData.coverImageUrl"
                  type="text"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <!-- Description -->
            <div class="sm:col-span-6">
              <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
              <div class="mt-1">
                <textarea
                  id="description"
                  v-model="formData.description"
                  rows="4"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                ></textarea>
              </div>
            </div>
          </div>
          
          <!-- Form Actions -->
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="handleCancel"
              class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <span v-if="loading">{{ isEditing ? 'Updating...' : 'Creating...' }}</span>
              <span v-else>{{ isEditing ? 'Update Vinyl' : 'Create Vinyl' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
