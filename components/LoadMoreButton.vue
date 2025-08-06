<template>
    <button
        class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-blue-400"
        :disabled="isLoading || !hasNextPage"
        @click="$emit('click')"
    >
        <span v-if="isLoading">Memuat...</span>
        <span v-else-if="!hasNextPage && noMoreText">{{ noMoreText }}</span>
        <span v-else>{{ buttonText }}</span>
    </button>
</template>

<script setup lang="ts">
defineProps({
    isLoading: {
        type: Boolean,
        default: false
    },
    hasNextPage: {
        type: Boolean,
        default: true
    },
    buttonText: {
        type: String,
        default: "Muat Lebih Banyak"
    },
    noMoreText: {
        type: String,
        default: ""
    }
});

defineEmits(["click"]);
</script>
