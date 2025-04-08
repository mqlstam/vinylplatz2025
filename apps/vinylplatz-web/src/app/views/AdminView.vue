<script setup lang="ts">
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <h1 class="text-3xl font-bold mb-6">Admin Dashboard</h1>
    
    <div class="bg-white shadow overflow-hidden rounded-lg">
      <div class="px-4 py-5 sm:px-6">
        <h2 class="text-lg font-medium text-gray-900">Admin Controls</h2>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">Administrative functions and data management.</p>
      </div>
      <div class="border-t border-gray-200 px-4 py-5 sm:p-6">
        <p class="mb-4">Welcome, {{ auth.user?.name }}! You are logged in as an administrator.</p>
        
        <div class="mt-6">
          <h3 class="text-md font-medium mb-3">Admin Functions</h3>
          <ul class="list-disc pl-5 space-y-2">
            <li>Manage Users</li>
            <li>Manage Vinyl Records</li>
            <li>Manage Orders</li>
            <li>View System Statistics</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
