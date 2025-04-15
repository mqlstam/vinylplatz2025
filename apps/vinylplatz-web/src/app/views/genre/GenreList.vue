<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { genreService, Genre } from '../../services/genre.service';

const auth = useAuthStore();
const genres = ref<Genre[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const searchTerm = ref('');

// For admin functionality
const showAddForm = ref(false);
const newGenre = ref({ name: '', description: '' });
const editingGenre = ref<Genre | null>(null);
const formError = ref<string | null>(null);
const formSuccess = ref<string | null>(null);

const isAdmin = computed(() => auth.isAdmin);

const filteredGenres = computed(() => {
  if (!searchTerm.value) return genres.value;
  
  const term = searchTerm.value.toLowerCase();
  return genres.value.filter(genre => 
    genre.name.toLowerCase().includes(term) || 
    (genre.description && genre.description.toLowerCase().includes(term))
  );
});

// Load all genres
const loadGenres = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    genres.value = await genreService.getAll();
  } catch (err) {
    console.error('Error loading genres:', err);
    error.value = 'Failed to load genres. Please try again later.';
  } finally {
    loading.value = false;
  }
};

// Admin functions
const addGenre = async () => {
  formError.value = null;
  formSuccess.value = null;
  
  if (!newGenre.value.name) {
    formError.value = 'Genre name is required';
    return;
  }
  
  try {
    const created = await genreService.create(newGenre.value);
    genres.value.push(created);
    formSuccess.value = `Genre "${created.name}" created successfully`;
    newGenre.value = { name: '', description: '' };
    showAddForm.value = false;
  } catch (err: any) {
    console.error('Error creating genre:', err);
    formError.value = err.response?.data?.message || 'Failed to create genre';
  }
};

const startEdit = (genre: Genre) => {
  editingGenre.value = { ...genre };
};

const cancelEdit = () => {
  editingGenre.value = null;
  formError.value = null;
};

const updateGenre = async () => {
  if (!editingGenre.value) return;
  
  formError.value = null;
  formSuccess.value = null;
  
  if (!editingGenre.value.name) {
    formError.value = 'Genre name is required';
    return;
  }
  
  try {
    const updated = await genreService.update(
      editingGenre.value.id, 
      {
        name: editingGenre.value.name,
        description: editingGenre.value.description
      }
    );
    
    // Update the genre in the list
    const index = genres.value.findIndex(g => g.id === updated.id);
    if (index !== -1) {
      genres.value[index] = updated;
    }
    
    formSuccess.value = `Genre "${updated.name}" updated successfully`;
    editingGenre.value = null;
  } catch (err: any) {
    console.error('Error updating genre:', err);
    formError.value = err.response?.data?.message || 'Failed to update genre';
  }
};

const deleteGenre = async (id: string) => {
  if (!confirm('Are you sure you want to delete this genre?')) {
    return;
  }
  
  formError.value = null;
  formSuccess.value = null;
  
  try {
    await genreService.delete(id);
    genres.value = genres.value.filter(g => g.id !== id);
    formSuccess.value = 'Genre deleted successfully';
  } catch (err: any) {
    console.error('Error deleting genre:', err);
    formError.value = err.response?.data?.message || 'Failed to delete genre';
  }
};

// Reset messages after 5 seconds
const resetMessages = () => {
  setTimeout(() => {
    formSuccess.value = null;
    formError.value = null;
  }, 5000);
};

// Watch for success or error messages and reset them
watch([formSuccess, formError], ([newSuccess, newError]) => {
  if (newSuccess || newError) {
    resetMessages();
  }
});

onMounted(() => {
  loadGenres();
});
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <h1 class="text-3xl font-bold mb-4 sm:mb-0">Music Genres</h1>
      
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- Search input -->
        <div class="relative">
          <input
            type="text"
            v-model="searchTerm"
            placeholder="Search genres..."
            class="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
          <span v-if="searchTerm" @click="searchTerm = ''" class="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700">
            &times;
          </span>
        </div>
        
        <!-- Add button (Admin only) -->
        <button 
          v-if="isAdmin"
          @click="showAddForm = !showAddForm" 
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {{ showAddForm ? 'Cancel' : 'Add Genre' }}
        </button>
      </div>
    </div>
    
    <!-- Success message -->
    <div v-if="formSuccess" class="mb-6 bg-green-50 p-4 rounded-md border border-green-200">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-green-800">
            {{ formSuccess }}
          </p>
        </div>
      </div>
    </div>
    
    <!-- Error message -->
    <div v-if="formError" class="mb-6 bg-red-50 p-4 rounded-md border border-red-200">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-red-800">
            {{ formError }}
          </p>
        </div>
      </div>
    </div>
    
    <!-- Add genre form (Admin only) -->
    <div v-if="showAddForm && isAdmin" class="bg-white shadow rounded-lg mb-6 p-4">
      <h2 class="text-lg font-medium mb-4">Add New Genre</h2>
      <form @submit.prevent="addGenre" class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            v-model="newGenre.name"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            v-model="newGenre.description"
            rows="3"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          ></textarea>
        </div>
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="showAddForm = false"
            class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Genre
          </button>
        </div>
      </form>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="text-center py-12">
      <p class="text-xl text-gray-600">Loading genres...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 p-4 rounded-md">
      <p class="text-red-800">{{ error }}</p>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="filteredGenres.length === 0" class="text-center py-12">
      <p v-if="searchTerm" class="text-xl text-gray-600">
        No genres found matching "{{ searchTerm }}". Try a different search term.
      </p>
      <p v-else class="text-xl text-gray-600">
        No genres available. 
        <span v-if="isAdmin">Click "Add Genre" to create the first one.</span>
      </p>
    </div>
    
    <!-- Genres list -->
    <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
      <ul class="divide-y divide-gray-200">
        <li v-for="genre in filteredGenres" :key="genre.id" class="px-4 py-4 sm:px-6">
          <!-- Editing mode -->
          <div v-if="editingGenre && editingGenre.id === genre.id">
            <form @submit.prevent="updateGenre" class="space-y-4">
              <div>
                <label for="edit-name" class="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  id="edit-name"
                  v-model="editingGenre.name"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label for="edit-description" class="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="edit-description"
                  v-model="editingGenre.description"
                  rows="3"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                ></textarea>
              </div>
              <div class="flex justify-end space-x-3">
                <button
                  type="button"
                  @click="cancelEdit"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
          
          <!-- View mode -->
          <div v-else>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-medium text-gray-900">{{ genre.name }}</h3>
                <p v-if="genre.description" class="mt-1 text-sm text-gray-600">{{ genre.description }}</p>
                <p v-else class="mt-1 text-sm text-gray-500 italic">No description available</p>
              </div>
              
              <!-- Admin actions -->
              <div v-if="isAdmin" class="flex space-x-2">
                <button
                  @click="startEdit(genre)"
                  class="inline-flex items-center p-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  @click="deleteGenre(genre.id)"
                  class="inline-flex items-center p-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-red-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
