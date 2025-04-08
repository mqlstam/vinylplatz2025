<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  currentPage: number;
  totalPages: number;
  totalItems: number;
  loading?: boolean;
}>();

const emit = defineEmits(['page-change']);

// Determine which pages to show
const visiblePages = computed(() => {
  const totalToShow = 5; // Show at most 5 page numbers
  const totalPages = props.totalPages;
  const currentPage = props.currentPage;

  if (totalPages <= totalToShow) {
    // If we have less than 5 pages, show all of them
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Always show first, last, current, and pages adjacent to current
  let pages = [1, totalPages, currentPage];

  // Add page before and after current if they exist
  if (currentPage > 1) pages.push(currentPage - 1);
  if (currentPage < totalPages) pages.push(currentPage + 1);

  // Sort and deduplicate
  pages = [...new Set(pages)].sort((a, b) => a - b);

  // Add ellipses indicators
  const result = [];
  let prevPage = 0;

  for (const page of pages) {
    if (page - prevPage > 1) {
      // There's a gap, add an ellipsis
      result.push(-1); // Use -1 to represent ellipsis
    }
    result.push(page);
    prevPage = page;
  }

  return result;
});

// Handler for page click
const goToPage = (page: number) => {
  if (page < 1 || page > props.totalPages || page === props.currentPage || props.loading) {
    return;
  }
  emit('page-change', page);
};
</script>

<template>
  <div class="flex justify-between items-center border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-6">
    <div class="flex-1 flex justify-between sm:hidden">
      <!-- Mobile pagination -->
      <button
        :disabled="currentPage === 1 || loading"
        @click="goToPage(currentPage - 1)"
        class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <button
        :disabled="currentPage === totalPages || loading"
        @click="goToPage(currentPage + 1)"
        class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
    <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-gray-700">
          Showing
          <span class="font-medium">{{ totalItems === 0 ? 0 : (currentPage - 1) * 12 + 1 }}</span>
          to
          <span class="font-medium">{{ Math.min(currentPage * 12, totalItems) }}</span>
          of
          <span class="font-medium">{{ totalItems }}</span>
          results
        </p>
      </div>
      <div>
        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <!-- Previous Page Button -->
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1 || loading"
            class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="sr-only">Previous</span>
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <!-- Page Numbers -->
          <template v-for="(page, index) in visiblePages" :key="index">
            <!-- Ellipsis -->
            <span v-if="page === -1" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
              ...
            </span>
            
            <!-- Page Number -->
            <button
              v-else
              @click="goToPage(page)"
              :disabled="page === currentPage || loading"
              class="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
              :class="[
                page === currentPage 
                  ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600 cursor-default'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              ]"
            >
              {{ page }}
            </button>
          </template>
          
          <!-- Next Page Button -->
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages || loading"
            class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="sr-only">Next</span>
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>
