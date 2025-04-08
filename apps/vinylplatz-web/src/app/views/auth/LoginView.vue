<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';
import type { LoginCredentials } from '@vinylplatz/web-auth';

const auth = useAuthStore();
const router = useRouter();

const credentials = ref<LoginCredentials>({
  email: '',
  password: '',
});

const loginError = ref<string | null>(null);
const isSubmitting = ref<boolean>(false);

const handleSubmit = async () => {
  loginError.value = null;
  isSubmitting.value = true;
  
  try {
    const success = await auth.login(credentials.value);
    if (success) {
      router.push('/');
    } else {
      loginError.value = auth.error || 'Login failed. Please try again.';
    }
  } catch (error) {
    loginError.value = 'An unexpected error occurred. Please try again.';
    console.error('Login error:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Sign in to your account</h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Or
        <router-link to="/register" class="font-medium text-indigo-600 hover:text-indigo-500">create a new account</router-link>
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <div v-if="loginError" class="rounded-md bg-red-50 p-4 mb-4">
            <div class="flex">
              <div class="text-sm text-red-700">{{ loginError }}</div>
            </div>
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
            <div class="mt-1">
              <input
                id="email"
                v-model="credentials.email"
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
                v-model="credentials.password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
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
              <span v-if="isSubmitting">Signing in...</span>
              <span v-else>Sign in</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
