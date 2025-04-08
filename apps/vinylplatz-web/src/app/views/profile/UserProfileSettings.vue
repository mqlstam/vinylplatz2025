<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';
import { ProfileUpdateData } from '../../services/user.service';

const auth = useAuthStore();
const router = useRouter();

// Form data
const profileData = ref<ProfileUpdateData>({
  name: '',
  email: '',
  password: '',
  profileImage: '',
  address: '',
});

// Password confirmation
const confirmPassword = ref('');
// Validation errors
const formErrors = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});
// Submission state
const isSubmitting = ref(false);

// Initialize form with current user data
onMounted(() => {
  if (auth.user) {
    profileData.value.name = auth.user.name || '';
    profileData.value.email = auth.user.email || '';
    profileData.value.profileImage = auth.user.profileImage || '';
    profileData.value.address = auth.user.address || '';
  }
  // Clear any previous update status
  auth.clearUpdateStatus();
});

// Form validation
const validateForm = () => {
  let isValid = true;
  // Reset errors
  formErrors.value = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  // Name validation
  if (profileData.value.name && profileData.value.name.trim().length < 2) {
    formErrors.value.name = 'Name must be at least 2 characters long';
    isValid = false;
  }

  // Email validation
  if (profileData.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.value.email)) {
    formErrors.value.email = 'Please enter a valid email address';
    isValid = false;
  }

  // Password validation
  if (profileData.value.password && profileData.value.password.length < 6) {
    formErrors.value.password = 'Password must be at least 6 characters long';
    isValid = false;
  }

  // Password confirmation
  if (profileData.value.password && profileData.value.password !== confirmPassword.value) {
    formErrors.value.confirmPassword = 'Passwords do not match';
    isValid = false;
  }

  return isValid;
};

// Form submission
const handleSubmit = async () => {
  // Validate form
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  try {
    // Create update data object only with filled fields
    const updateData: ProfileUpdateData = {};
    if (profileData.value.name) updateData.name = profileData.value.name;
    if (profileData.value.email) updateData.email = profileData.value.email;
    if (profileData.value.password) updateData.password = profileData.value.password;
    if (profileData.value.profileImage) updateData.profileImage = profileData.value.profileImage;
    if (profileData.value.address) updateData.address = profileData.value.address;

    // Only send request if there's something to update
    if (Object.keys(updateData).length > 0) {
      const success = await auth.updateProfile(updateData);
      if (success) {
        // Reset password fields
        profileData.value.password = '';
        confirmPassword.value = '';
      }
    }
  } catch (error) {
    console.error('Error updating profile:', error);
  } finally {
    isSubmitting.value = false;
  }
};

// Cancel edits
const handleCancel = () => {
  router.push('/profile');
};

// Check if form has changes
const hasChanges = computed(() => {
  if (!auth.user) return false;
  
  return (
    profileData.value.name !== auth.user.name ||
    profileData.value.email !== auth.user.email ||
    profileData.value.password !== '' ||
    profileData.value.profileImage !== auth.user.profileImage ||
    profileData.value.address !== auth.user.address
  );
});
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <h1 class="text-3xl font-bold mb-6">Edit Your Profile</h1>
    
    <!-- Success Message -->
    <div v-if="auth.updateSuccess" class="mb-6 bg-green-50 p-4 rounded-md border border-green-200">
      <div class="flex">
        <div class="flex-shrink-0">
          <!-- Heroicon name: solid/check-circle -->
          <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-green-800">
            Your profile has been updated successfully.
          </p>
        </div>
      </div>
    </div>
    
    <!-- Error Message -->
    <div v-if="auth.error" class="mb-6 bg-red-50 p-4 rounded-md border border-red-200">
      <div class="flex">
        <div class="flex-shrink-0">
          <!-- Heroicon name: solid/x-circle -->
          <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-red-800">
            {{ auth.error }}
          </p>
        </div>
      </div>
    </div>
    
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Name Field -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
          <div class="mt-1">
            <input
              id="name"
              v-model="profileData.name"
              type="text"
              class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
            <p v-if="formErrors.name" class="mt-1 text-sm text-red-600">{{ formErrors.name }}</p>
          </div>
        </div>
        
        <!-- Email Field -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
          <div class="mt-1">
            <input
              id="email"
              v-model="profileData.email"
              type="email"
              class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
            <p v-if="formErrors.email" class="mt-1 text-sm text-red-600">{{ formErrors.email }}</p>
          </div>
        </div>
        
        <!-- Password Field -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">New Password (leave blank to keep current)</label>
          <div class="mt-1">
            <input
              id="password"
              v-model="profileData.password"
              type="password"
              class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
            <p v-if="formErrors.password" class="mt-1 text-sm text-red-600">{{ formErrors.password }}</p>
          </div>
        </div>
        
        <!-- Confirm Password Field -->
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm New Password</label>
          <div class="mt-1">
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
            <p v-if="formErrors.confirmPassword" class="mt-1 text-sm text-red-600">{{ formErrors.confirmPassword }}</p>
          </div>
        </div>
        
        <!-- Profile Image URL Field -->
        <div>
          <label for="profileImage" class="block text-sm font-medium text-gray-700">Profile Image URL</label>
          <div class="mt-1">
            <input
              id="profileImage"
              v-model="profileData.profileImage"
              type="text"
              class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <!-- Address Field -->
        <div>
          <label for="address" class="block text-sm font-medium text-gray-700">Address</label>
          <div class="mt-1">
            <textarea
              id="address"
              v-model="profileData.address"
              rows="3"
              class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            ></textarea>
          </div>
        </div>
        
        <!-- Form Actions -->
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="handleCancel"
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting || !hasChanges"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
