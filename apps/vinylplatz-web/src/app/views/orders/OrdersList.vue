    </div>
    
    <!-- Status filter -->
    <div class="mb-6">
      <div class="flex flex-wrap gap-2">
        <button
          @click="filterByStatus(null)"
          class="px-3 py-1 text-sm rounded-full border"
          :class="filters.status === undefined ? 'bg-gray-100 border-gray-400' : 'border-gray-300 text-gray-700'"
        >
          All Statuses
        </button>
        <button
          v-for="status in Object.values(OrderStatus)"
          :key="status"
          @click="filterByStatus(status)"
          class="px-3 py-1 text-sm rounded-full border"
          :class="filters.status === status ? statusColors[status] : 'border-gray-300 text-gray-700'"
        >
          {{ status.charAt(0).toUpperCase() + status.slice(1) }}
        </button>
      </div>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="text-center py-12">
      <p class="text-xl text-gray-600">Loading orders...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 p-4 rounded-md">
      <p class="text-red-800">{{ error }}</p>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="orders.length === 0" class="text-center py-12 bg-white shadow rounded-lg">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
      <p class="mt-1 text-sm text-gray-500">
        <span v-if="filters.status">
          No {{ filters.status }} orders found. Try a different status filter.
        </span>
        <span v-else-if="activeTab === 'purchases'">
          You haven't made any purchases yet.
        </span>
        <span v-else-if="activeTab === 'sales'">
          You haven't sold any vinyl records yet.
        </span>
        <span v-else>
          No orders found.
        </span>
      </p>
      <div class="mt-6">
        <router-link
          to="/vinyls"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Browse Vinyls
        </router-link>
      </div>
    </div>
    
    <!-- Orders list -->
    <div v-else class="bg-white shadow overflow-hidden sm:rounded-lg">
      <ul class="divide-y divide-gray-200">
        <li 
          v-for="order in orders" 
          :key="order.id" 
          class="p-4 hover:bg-gray-50 cursor-pointer"
          @click="viewOrderDetails(order.id)"
        >
          <div class="sm:flex sm:items-center sm:justify-between">
            <div class="sm:flex sm:items-center">
              <!-- Vinyl thumbnail -->
              <div class="flex-shrink-0 h-20 w-20 bg-gray-200 rounded-md overflow-hidden">
                <img 
                  v-if="order.vinyl.coverImageUrl" 
                  :src="order.vinyl.coverImageUrl" 
                  :alt="order.vinyl.title" 
                  class="h-full w-full object-cover"
                />
                <div v-else class="h-full w-full flex items-center justify-center bg-gray-100">
                  <svg class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                </div>
              </div>
              
              <!-- Order info -->
              <div class="mt-3 sm:mt-0 sm:ml-4">
                <h3 class="text-lg font-medium text-gray-900">{{ order.vinyl.title }}</h3>
                <p class="text-sm text-gray-500">{{ order.vinyl.artist }}</p>
                <div class="flex items-center mt-1">
                  <span class="text-sm text-gray-500 mr-2">
                    {{ 
                      auth.user?.id === order.buyer.id 
                        ?  
                        :  
                    }}
                  </span>
                  <span class="px-2 py-0.5 text-xs rounded-full" :class="statusColors[order.status]">
                    {{ order.status.charAt(0).toUpperCase() + order.status.slice(1) }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="mt-3 sm:mt-0 flex flex-col items-end">
              <p class="text-lg font-medium text-indigo-600">{{ formatPrice(order.price) }}</p>
              <p class="text-sm text-gray-500">{{ formatDate(order.orderDate) }}</p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
    </div>
    
    <!-- Status filter -->
    <div class="mb-6">
      <div class="flex flex-wrap gap-2">
        <button
          @click="filterByStatus(null)"
          class="px-3 py-1 text-sm rounded-full border"
          :class="filters.status === undefined ? 'bg-gray-100 border-gray-400' : 'border-gray-300 text-gray-700'"
        >
          All Statuses
        </button>
        <button
          v-for="status in Object.values(OrderStatus)"
          :key="status"
          @click="filterByStatus(status)"
          class="px-3 py-1 text-sm rounded-full border"
          :class="filters.status === status ? statusColors[status] : 'border-gray-300 text-gray-700'"
        >
          {{ status.charAt(0).toUpperCase() + status.slice(1) }}
        </button>
      </div>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="text-center py-12">
      <p class="text-xl text-gray-600">Loading orders...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 p-4 rounded-md">
      <p class="text-red-800">{{ error }}</p>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="orders.length === 0" class="text-center py-12 bg-white shadow rounded-lg">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
      <p class="mt-1 text-sm text-gray-500">
        <span v-if="filters.status">
          No {{ filters.status }} orders found. Try a different status filter.
        </span>
        <span v-else-if="activeTab === 'purchases'">
          You haven't made any purchases yet.
        </span>
        <span v-else-if="activeTab === 'sales'">
          You haven't sold any vinyl records yet.
        </span>
        <span v-else>
          No orders found.
        </span>
      </p>
      <div class="mt-6">
        <router-link
          to="/vinyls"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Browse Vinyls
        </router-link>
      </div>
    </div>
    
    <!-- Orders list -->
    <div v-else class="bg-white shadow overflow-hidden sm:rounded-lg">
      <ul class="divide-y divide-gray-200">
        <li 
          v-for="order in orders" 
          :key="order.id" 
          class="p-4 hover:bg-gray-50 cursor-pointer"
          @click="viewOrderDetails(order.id)"
        >
          <div class="sm:flex sm:items-center sm:justify-between">
            <div class="sm:flex sm:items-center">
              <!-- Vinyl thumbnail -->
              <div class="flex-shrink-0 h-20 w-20 bg-gray-200 rounded-md overflow-hidden">
                <img 
                  v-if="order.vinyl.coverImageUrl" 
                  :src="order.vinyl.coverImageUrl" 
                  :alt="order.vinyl.title" 
                  class="h-full w-full object-cover"
                />
                <div v-else class="h-full w-full flex items-center justify-center bg-gray-100">
                  <svg class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                </div>
              </div>
              
              <!-- Order info -->
              <div class="mt-3 sm:mt-0 sm:ml-4">
                <h3 class="text-lg font-medium text-gray-900">{{ order.vinyl.title }}</h3>
                <p class="text-sm text-gray-500">{{ order.vinyl.artist }}</p>
                <div class="flex items-center mt-1">
                  <span class="text-sm text-gray-500 mr-2">
                    {{ 
                      auth.user?.id === order.buyer.id 
                        ?  
                        :  
                    }}
                  </span>
                  <span class="px-2 py-0.5 text-xs rounded-full" :class="statusColors[order.status]">
                    {{ order.status.charAt(0).toUpperCase() + order.status.slice(1) }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="mt-3 sm:mt-0 flex flex-col items-end">
              <p class="text-lg font-medium text-indigo-600">{{ formatPrice(order.price) }}</p>
              <p class="text-sm text-gray-500">{{ formatDate(order.orderDate) }}</p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
    </div>
    
    <!-- Status filter -->
    <div class="mb-6">
      <div class="flex flex-wrap gap-2">
        <button
          @click="filterByStatus(null)"
          class="px-3 py-1 text-sm rounded-full border"
          :class="filters.status === undefined ? 'bg-gray-100 border-gray-400' : 'border-gray-300 text-gray-700'"
        >
          All Statuses
        </button>
        <button
          v-for="status in Object.values(OrderStatus)"
          :key="status"
          @click="filterByStatus(status)"
          class="px-3 py-1 text-sm rounded-full border"
          :class="filters.status === status ? statusColors[status] : 'border-gray-300 text-gray-700'"
        >
          {{ status.charAt(0).toUpperCase() + status.slice(1) }}
        </button>
      </div>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="text-center py-12">
      <p class="text-xl text-gray-600">Loading orders...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 p-4 rounded-md">
      <p class="text-red-800">{{ error }}</p>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="orders.length === 0" class="text-center py-12 bg-white shadow rounded-lg">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
      <p class="mt-1 text-sm text-gray-500">
        <span v-if="filters.status">
          No {{ filters.status }} orders found. Try a different status filter.
        </span>
        <span v-else-if="activeTab === 'purchases'">
          You haven't made any purchases yet.
        </span>
        <span v-else-if="activeTab === 'sales'">
          You haven't sold any vinyl records yet.
        </span>
        <span v-else>
          No orders found.
        </span>
      </p>
      <div class="mt-6">
        <router-link
          to="/vinyls"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Browse Vinyls
        </router-link>
      </div>
    </div>
    
    <!-- Orders list -->
    <div v-else class="bg-white shadow overflow-hidden sm:rounded-lg">
      <ul class="divide-y divide-gray-200">
        <li 
          v-for="order in orders" 
          :key="order.id" 
          class="p-4 hover:bg-gray-50 cursor-pointer"
          @click="viewOrderDetails(order.id)"
        >
          <div class="sm:flex sm:items-center sm:justify-between">
            <div class="sm:flex sm:items-center">
              <!-- Vinyl thumbnail -->
              <div class="flex-shrink-0 h-20 w-20 bg-gray-200 rounded-md overflow-hidden">
                <img 
                  v-if="order.vinyl.coverImageUrl" 
                  :src="order.vinyl.coverImageUrl" 
                  :alt="order.vinyl.title" 
                  class="h-full w-full object-cover"
                />
                <div v-else class="h-full w-full flex items-center justify-center bg-gray-100">
                  <svg class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                </div>
              </div>
              
              <!-- Order info -->
              <div class="mt-3 sm:mt-0 sm:ml-4">
                <h3 class="text-lg font-medium text-gray-900">{{ order.vinyl.title }}</h3>
                <p class="text-sm text-gray-500">{{ order.vinyl.artist }}</p>
                <div class="flex items-center mt-1">
                  <span class="text-sm text-gray-500 mr-2">
                    {{ 
                      auth.user?.id === order.buyer.id 
                        ? `Purchased from ${order.seller.name}` 
                        : `Sold to ${order.buyer.name}` 
                    }}
                  </span>
                  <span class="px-2 py-0.5 text-xs rounded-full" :class="statusColors[order.status]">
                    {{ order.status.charAt(0).toUpperCase() + order.status.slice(1) }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="mt-3 sm:mt-0 flex flex-col items-end">
              <p class="text-lg font-medium text-indigo-600">{{ formatPrice(order.price) }}</p>
              <p class="text-sm text-gray-500">{{ formatDate(order.orderDate) }}</p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
