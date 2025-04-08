<script setup lang="ts">
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <h1 class="text-3xl font-bold mb-6">Your Profile</h1>
    
    <div v-if="auth.user" class="bg-white shadow overflow-hidden rounded-lg">
      <div class="px-4 py-5 sm:px-6">
        <h2 class="text-lg font-medium text-gray-900">Personal Information</h2>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">Your personal details and preferences.</p>
      </div>
      <div class="border-t border-gray-200 px-4 py-5 sm:p-6">
        <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt class="text-sm font-medium text-gray-500">Full name</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ auth.user.name }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Email address</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ auth.user.email }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Role</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ auth.user.role }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Member since</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ new Date(auth.user.registrationDate).toLocaleDateString() }}</dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="text-sm font-medium text-gray-500">Address</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ auth.user.address || 'Not provided' }}</dd>
          </div>
        </dl>
      </div>
    </div>
    
    <div v-else class="text-center py-12">
      <p class="text-xl text-gray-600">Loading profile information...</p>
    </div>
  </div>
</template>
