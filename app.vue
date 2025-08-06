<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <NuxtRouteAnnouncer />
        <ClientOnly>
            <NuxtPage />
            <template #fallback>
                <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </template>
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
import { useTheme } from "~/composables/useTheme";

// Initialize theme on app startup
const { initializeTheme } = useTheme();

// Initialize theme immediately on client
if (process.client) {
    nextTick(() => {
        initializeTheme();
    });
}

// Add no-js class fallback
onMounted(() => {
    if (typeof document !== "undefined") {
        document.documentElement.classList.remove("no-js");
    }
});
</script>
