<template>
    <button
        @click="goBack"
        class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
        :class="buttonClass"
    >
        <ArrowLeftIcon class="w-4 h-4 mr-2" />
        {{ label }}
    </button>
</template>

<script setup lang="ts">
import { ArrowLeftIcon } from "@heroicons/vue/24/outline";

interface Props {
    label?: string;
    to?: string;
    buttonClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
    label: "Kembali",
    to: "",
    buttonClass: "hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-3 py-2"
});

const router = useRouter();

const goBack = () => {
    if (props.to) {
        // Navigate to specific route
        router.push(props.to);
    } else {
        // Go back to previous page
        router.back();
    }
};
</script>
