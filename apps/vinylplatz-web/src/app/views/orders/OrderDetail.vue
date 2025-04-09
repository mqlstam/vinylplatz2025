<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { orderService, Order, OrderStatus } from '../../services/order.service';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

// Data
const order = ref<Order | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const updatingStatus = ref(false);
const showStatusModal = ref(false);
const selectedStatus = ref<OrderStatus | null>(null);

// Get the order ID from the route
const orderId = computed(() => route.params.id as string);

// Computed properties
const isSeller = computed(() => {
  return auth.user && order.value && auth.user.id === order.value.seller.id;
});

const isBuyer = computed(() => {
  return auth.user && order.value && auth.user.id === order.value.buyer.id;
});

// Status colors for badges
const statusColors = {
  [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.PAID]: 'bg-blue-100 text-blue-800',
  [OrderStatus.SHIPPED]: 'bg-purple-100 text-purple-800',
  [OrderStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800'
};

// Status options based on current status (valid transitions)
const statusOptions = computed(() => {
  if (!order.value) return [];
  
  const currentStatus = order.value.status;
  // Define valid transitions
  const validTransitions = {
    [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
    [OrderStatus.PAID]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
    [OrderStatus.COMPLETED]: [], // Terminal state
    [OrderStatus.CANCELLED]: [], // Terminal state
  };
  
  return validTransitions[currentStatus];
});

// Load order details
const loadOrder = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    order.value = await orderService.getOrderById(orderId.value);
  } catch (err) {
    console.error('Error loading order details:', err);
    error.value = 'Failed to load order details. Please try again later.';
  } finally {
    loading.value = false;
  }
};

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

// Change order status (seller only)
const openStatusModal = () => {
  selectedStatus.value = null;
  showStatusModal.value = true;
};

const updateOrderStatus = async () => {
  if (!selectedStatus.value || !order.value) return;
  
  updatingStatus.value = true;
  
  try {
    order.value = await orderService.updateOrderStatus(order.value.id, selectedStatus.value);
    showStatusModal.value = false;
  } catch (err) {
    console.error('Error updating order status:', err);
    error.value = 'Failed to update order status. Please try again.';
  } finally {
    updatingStatus.value = false;
  }
};

// Go back to orders list
const goBack = () => {
  router.push('/orders');
};

// Go to vinyl details
const viewVinyl = () => {
  if (order.value) {
    router.push(`/vinyls/${order.value.vinyl.id}`);
  }
};

// On component mount
onMounted(() => {
  // Redirect if not authenticated
  if (!auth.isAuthenticated) {
    router.push('/login');
    return;
  }
  
  loadOrder();
});
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <!-- Loading state -->
    <div v-if="loading" class="text-center py-12">
      <p class="text-xl text-gray-600">Loading order details...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 p-4 rounded-md mb-4">
      <p class="text-red-800">{{ error }}</p>
      <button
        @click="goBack"
        class="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Back to Orders
      </button>
    </div>
    
    <!-- Order details -->
    <div v-else-if="order" class="bg-white shadow overflow-hidden sm:rounded-lg">
      <!-- Header -->
      <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h1 class="text-xl font-semibold text-gray-900">
            Order #{{ order.id.slice(-8).toUpperCase() }}
          </h1>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">
            Placed on {{ formatDate(order.orderDate) }}
          </p>
        </div>
        <div
          class="px-3 py-1 text-sm font-medium rounded-full"
          :class="statusColors[order.status]"
        >
          {{ order.status.charAt(0).toUpperCase() + order.status.slice(1) }}
        </div>
      </div>
      
      <!-- Vinyl & Order Details -->
      <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
        <div class="flex flex-col md:flex-row">
          <!-- Vinyl Details -->
          <div class="md:w-1/2 mb-6 md:mb-0 md:pr-4">
            <h2 class="text-lg font-medium text-gray-900 mb-3">Vinyl Details</h2>
            <div class="flex">
              <!-- Vinyl Thumbnail -->
              <div class="flex-shrink-0 h-24 w-24 bg-gray-200 rounded-md overflow-hidden">
                <img 
                  v-if="order.vinyl.coverImageUrl" 
                  :src="order.vinyl.coverImageUrl" 
                  :alt="order.vinyl.title" 
                  class="h-full w-full object-cover"
                />
                <div v-else class="h-full w-full flex items-center justify-center bg-gray-100">
                  <svg class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                </div>
              </div>
              
              <!-- Vinyl Info -->
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">{{ order.vinyl.title }}</h3>
                <p class="text-sm text-gray-500">{{ order.vinyl.artist }}</p>
                <p class="mt-2 text-lg font-medium text-indigo-600">{{ formatPrice(order.price) }}</p>
                <button
                  @click="viewVinyl"
                  class="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
                >
                  View Vinyl Details
                </button>
              </div>
            </div>
          </div>
          
          <!-- Order Info -->
          <div class="md:w-1/2 md:pl-4 md:border-l md:border-gray-200">
            <h2 class="text-lg font-medium text-gray-900 mb-3">Order Information</h2>
            <dl class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">Buyer</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ order.buyer.name }}</dd>
              </div>
              <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">Seller</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ order.seller.name }}</dd>
              </div>
              <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">Order Date</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDate(order.orderDate) }}</dd>
              </div>
              <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">Order Status</dt>
                <dd class="mt-1 text-sm text-gray-900 flex items-center">
                  <span
                    class="px-2 py-0.5 text-xs rounded-full"
                    :class="statusColors[order.status]"
                  >
                    {{ order.status.charAt(0).toUpperCase() + order.status.slice(1) }}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      
      <!-- Action buttons -->
      <div class="border-t border-gray-200 px-4 py-5 sm:px-6 flex justify-between">
        <button
          @click="goBack"
          class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back to Orders
        </button>
        
        <button
          v-if="isSeller && statusOptions.length > 0"
          @click="openStatusModal"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Update Status
        </button>
      </div>
    </div>
    
    <!-- Status update modal -->
    <div v-if="showStatusModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Update Order Status</h3>
        
        <div class="space-y-3 mb-6">
          <div v-for="status in statusOptions" :key="status" class="flex items-center">
            <input
              type="radio"
              :id="status"
              name="status"
              :value="status"
              v-model="selectedStatus"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <label :for="status" class="ml-3 block text-sm font-medium text-gray-700">
              {{ status.charAt(0).toUpperCase() + status.slice(1) }}
            </label>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button
            @click="showStatusModal = false"
            class="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            @click="updateOrderStatus"
            :disabled="!selectedStatus || updatingStatus"
            class="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <span v-if="updatingStatus">Updating...</span>
            <span v-else>Update Status</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
