<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { vinylService, Vinyl } from '../../services/vinyl.service';
import { favoritesService } from '../../services/favorites.service';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

// Data
const vinyl = ref<Vinyl | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const showConfirmDelete = ref(false);
const deleting = ref(false);

// Favorite state
const isFavorited = ref(false);
const favoritesLoading = ref(false);

// Computed properties
const isAuthenticated = computed(() => auth.isAuthenticated);
const isOwner = computed(() => {
  return isAuthenticated.value && 
         vinyl.value && 
         auth.user && 
         vinyl.value.sellerId === auth.user.id;
});

// Get the vinyl ID from the route
const vinylId = computed(() => route.params.id as string);

// Load the vinyl data
const loadVinyl = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    vinyl.value = await vinylService.getById(vinylId.value);
    
    // Check favorite status if user is authenticated
    if (isAuthenticated.value) {
      checkFavoriteStatus();
    }
  } catch (err) {
    console.error('Error loading vinyl details:', err);
    error.value = 'Failed to load vinyl details. Please try again later.';
  } finally {
    loading.value = false;
  }
};

// Check if vinyl is in user's favorites
const checkFavoriteStatus = async () => {
  if (!isAuthenticated.value || !vinyl.value) return;
  
  try {
    isFavorited.value = await favoritesService.checkFavoriteStatus(vinyl.value.id);
  } catch (err) {
    console.error('Error checking favorite status:', err);
  }
};

// Toggle favorite status
const toggleFavorite = async () => {
  if (!isAuthenticated.value || !vinyl.value) {
    router.push('/login');
    return;
  }
  
  favoritesLoading.value = true;
  
  try {
    const response = await favoritesService.toggleFavorite(vinyl.value.id, isFavorited.value);
    isFavorited.value = response.isFavorited;
  } catch (err) {
    console.error('Error toggling favorite:', err);
  } finally {
    favoritesLoading.value = false;
  }
};

// Format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

// Edit vinyl
const editVinyl = () => {
  router.push(`/vinyls/edit/${vinylId.value}`);
};

// Delete vinyl
const deleteVinyl = async () => {
  if (!vinyl.value) return;
  
  deleting.value = true;
  
  try {
    await vinylService.delete(vinyl.value.id);
    router.push('/vinyls');
  } catch (err) {
    console.error('Error deleting vinyl:', err);
    error.value = 'Failed to delete this vinyl. Please try again later.';
    showConfirmDelete.value = false;
  } finally {
    deleting.value = false;
  }
};

// Go back to vinyl list
const goBack = () => {
  router.push('/vinyls');
};

// Lifecycle hooks
onMounted(() => {
  loadVinyl();
});
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <!-- Loading state -->
    <div v-if="loading" class="text-center py-12">
      <p class="text-xl text-gray-600">Loading vinyl details...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 p-4 rounded-md mb-4">
      <p class="text-red-800">{{ error }}</p>
    </div>
    
    <div v-else-if="vinyl" class="bg-white shadow overflow-hidden rounded-lg">
      <!-- Vinyl Header -->
      <div class="flex flex-col sm:flex-row">
        <!-- Vinyl Cover -->
        <div class="w-full sm:w-1/3 lg:w-1/4 bg-gray-200">
          <img 
            v-if="vinyl.coverImageUrl" 
            :src="vinyl.coverImageUrl" 
            :alt="vinyl.title" 
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full min-h-64 flex items-center justify-center bg-gray-100">
            <svg class="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
        </div>
        
        <!-- Vinyl Info -->
        <div class="p-6 w-full sm:w-2/3 lg:w-3/4 flex flex-col">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ vinyl.title }}</h1>
              <p class="text-xl text-gray-600">{{ vinyl.artist }}</p>
            </div>
            <div class="text-2xl font-bold text-indigo-600">
              {{ formatPrice(vinyl.price) }}
            </div>
          </div>
          
          <div class="mt-2 space-y-4">
            <div class="flex items-center">
              <span class="mr-2 font-semibold text-gray-700">Condition:</span>
              <span class="px-2 py-1 rounded-full text-sm font-medium" :class="{
                'bg-green-100 text-green-800': vinyl.condition === 'Mint' || vinyl.condition === 'Near Mint',
                'bg-blue-100 text-blue-800': vinyl.condition === 'Excellent' || vinyl.condition === 'Very Good Plus',
                'bg-yellow-100 text-yellow-800': vinyl.condition === 'Very Good' || vinyl.condition === 'Good',
                'bg-red-100 text-red-800': vinyl.condition === 'Fair' || vinyl.condition === 'Poor'
              }">
                {{ vinyl.condition }}
              </span>
            </div>
            
            <div v-if="vinyl.releaseYear">
              <span class="font-semibold text-gray-700">Release Year:</span>
              <span class="ml-2 text-gray-600">{{ vinyl.releaseYear }}</span>
            </div>
            
            <div v-if="vinyl.genre">
              <span class="font-semibold text-gray-700">Genre:</span>
              <span class="ml-2 text-gray-600">{{ vinyl.genre.name }}</span>
            </div>
            
            <div v-if="vinyl.seller">
              <span class="font-semibold text-gray-700">Seller:</span>
              <span class="ml-2 text-gray-600">{{ vinyl.seller.name }}</span>
            </div>
          </div>
          
          <div v-if="vinyl.description" class="mt-6">
            <h3 class="text-lg font-medium text-gray-900">Description</h3>
            <p class="mt-2 text-gray-600 whitespace-pre-line">{{ vinyl.description }}</p>
          </div>
          
          <div class="mt-auto pt-6 flex justify-between">
            <button
              @click="goBack"
              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Listings
            </button>
            
            <div class="flex space-x-3">
              <!-- Favorite button (only for authenticated users who are not the seller) -->
              <button
                v-if="isAuthenticated && !isOwner"
                @click="toggleFavorite"
                :disabled="favoritesLoading"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                :class="isFavorited ? 'bg-pink-600 hover:bg-pink-700' : 'bg-gray-600 hover:bg-gray-700'"
              >
                <svg 
                  class="h-5 w-5 mr-1" 
                  fill="currentColor" 
                  viewBox="0 0 20 20" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    v-if="isFavorited"
                    fill-rule="evenodd" 
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" 
                    clip-rule="evenodd"
                  />
                  <path 
                    v-else
                    fill-rule="evenodd" 
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" 
                    clip-rule="evenodd"
                    stroke="currentColor"
                    stroke-width="1"
                    fill="none"
                  />
                </svg>
                {{ isFavorited ? 'Favorited' : 'Add to Favorites' }}
              </button>
              
              <!-- Edit/Delete buttons (only for owner) -->
              <div v-if="isOwner" class="flex space-x-3">
                <button
                  @click="editVinyl"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit Listing
                </button>
                <button
                  @click="showConfirmDelete = true"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Listing
                </button>
              </div>
              
              <!-- Login to favorite (for unauthenticated users) -->
              <router-link
                v-if="!isAuthenticated"
                to="/login"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg class="h-5 w-5 mr-1" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
                Login to Favorite
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Not found state -->
    <div v-else class="text-center py-12">
      <p class="text-xl text-gray-600">Vinyl record not found.</p>
      <button
        @click="goBack"
        class="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Back to Listings
      </button>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showConfirmDelete" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-medium text-gray-900">Confirm Deletion</h3>
        <p class="mt-2 text-sm text-gray-500">
          Are you sure you want to delete this vinyl listing? This action cannot be undone.
        </p>
        <div class="mt-4 flex justify-end space-x-3">
          <button
            @click="showConfirmDelete = false"
            class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            :disabled="deleting"
          >
            Cancel
          </button>
          <button
            @click="deleteVinyl"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            :disabled="deleting"
          >
            <span v-if="deleting">Deleting...</span>
            <span v-else>Delete</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
