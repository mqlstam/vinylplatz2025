<script setup lang="ts">
// App root component
</script>

<template>
  <header class="bg-gray-800 text-white p-4">
    <div class="container mx-auto flex justify-between items-center">
      <h1 class="text-xl font-bold">VinylPlatz</h1>
      <nav>
        <router-link to="/" class="mr-4">Home</router-link>
        <router-link to="/about">About</router-link>
      </nav>
    </div>
  </header>
  
  <main>
    <router-view />
  </main>
</template>
