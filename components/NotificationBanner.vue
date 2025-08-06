<template>
    <div
        v-if="notification"
        class="relative"
        :class="{
            'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800': notification.type === 'info',
            'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800':
                notification.type === 'warning',
            'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800': notification.type === 'success',
            'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800': notification.type === 'error'
        }"
        role="alert"
    >
        <div
            class="border-l-4 p-4"
            :class="{
                'border-blue-400': notification.type === 'info',
                'border-yellow-400': notification.type === 'warning',
                'border-green-400': notification.type === 'success',
                'border-red-400': notification.type === 'error'
            }"
        >
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    <InformationCircleIcon
                        v-if="notification.type === 'info'"
                        class="h-5 w-5 text-blue-400"
                        aria-hidden="true"
                    />
                    <ExclamationTriangleIcon
                        v-else-if="notification.type === 'warning'"
                        class="h-5 w-5 text-yellow-400"
                        aria-hidden="true"
                    />
                    <CheckCircleIcon
                        v-else-if="notification.type === 'success'"
                        class="h-5 w-5 text-green-400"
                        aria-hidden="true"
                    />
                    <XCircleIcon
                        v-else-if="notification.type === 'error'"
                        class="h-5 w-5 text-red-400"
                        aria-hidden="true"
                    />
                </div>
                <div class="ml-3 flex-1">
                    <p
                        class="text-sm font-medium"
                        :class="{
                            'text-blue-800 dark:text-blue-200': notification.type === 'info',
                            'text-yellow-800 dark:text-yellow-200': notification.type === 'warning',
                            'text-green-800 dark:text-green-200': notification.type === 'success',
                            'text-red-800 dark:text-red-200': notification.type === 'error'
                        }"
                    >
                        {{ notification.message }}
                    </p>
                </div>
                <div v-if="dismissible" class="ml-auto pl-3">
                    <div class="-mx-1.5 -my-1.5">
                        <button
                            @click="dismiss"
                            type="button"
                            class="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
                            :class="{
                                'text-blue-500 hover:bg-blue-100 focus:ring-blue-600 focus:ring-offset-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30':
                                    notification.type === 'info',
                                'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600 focus:ring-offset-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-900/30':
                                    notification.type === 'warning',
                                'text-green-500 hover:bg-green-100 focus:ring-green-600 focus:ring-offset-green-50 dark:text-green-400 dark:hover:bg-green-900/30':
                                    notification.type === 'success',
                                'text-red-500 hover:bg-red-100 focus:ring-red-600 focus:ring-offset-red-50 dark:text-red-400 dark:hover:bg-red-900/30':
                                    notification.type === 'error'
                            }"
                            aria-label="Tutup notifikasi"
                        >
                            <span class="sr-only">Tutup</span>
                            <XMarkIcon class="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {
    InformationCircleIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    XMarkIcon
} from "@heroicons/vue/24/outline";

// Props
const props = defineProps({
    notification: {
        type: Object,
        default: null
    },
    dismissible: {
        type: Boolean,
        default: true
    }
});

// Emits
const emit = defineEmits(["dismiss"]);

// Methods
const dismiss = () => {
    emit("dismiss");
};
</script>
