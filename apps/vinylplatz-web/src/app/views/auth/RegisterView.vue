<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';
import type { RegisterData } from '@vinylplatz/web-auth';

const auth = useAuthStore();
const router = useRouter();

const userData = ref<RegisterData>({
  name: '',
  email: '',
  password: '',
  address: '',
});

const confirmPassword = ref<string>('');
const registerError = ref<string | null>(null);
const isSubmitting = ref<boolean>(false);

const handleSubmit = async () => {
  registerError.value = null;
  
  // Validate passwords match
  if (userData.value.password !== confirmPassword.value) {
    registerError.value = 'Passwords do not match';
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    const success = await auth.register(userData.value);
    if (success) {
      router.push('/');
    } else {
      registerError.value = auth.error || 'Registration failed. Please try again.';
    }
  } catch (error) {
    registerError.value = 'An unexpected error occurred. Please try again.';
    console.error('Registration error:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Create a new account</h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Or
        <router-link to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">sign in to your account</router-link>
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <div v-if="registerError" class="rounded-md bg-red-50 p-4 mb-4">
            <div class="flex">
              <div class="text-sm text-red-700">{{ registerError }}</div>
            </div>
          </div>
          
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
            <div class="mt-1">
              <input
                id="name"
                v-model="userData.name"
                name="name"
                type="text"
                autocomplete="name"
                required
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
            <div class="mt-1">
              <input
                id="email"
                v-model="userData.email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <div class="mt-1">
              <input
                id="password"
                v-model="userData.password"
                name="password"
                type="password"
                autocomplete="new-password"
                required
                minlength="6"
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label for="confirm-password" class="block text-sm font-medium text-gray-700">Confirm Password</label>
            <div class="mt-1">
              <input
                id="confirm-password"
                v-model="confirmPassword"
                name="confirm-password"
                type="password"
                required
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label for="address" class="block text-sm font-medium text-gray-700">Address (optional)</label>
            <div class="mt-1">
              <input
                id="address"
                v-model="userData.address"
                name="address"
                type="text"
                autocomplete="street-address"
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <span v-if="isSubmitting">Creating account...</span>
              <span v-else>Create account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
