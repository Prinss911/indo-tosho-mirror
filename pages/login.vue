<template>
    <ClientOnly>
        <div
            class="flex flex-col justify-center py-12 sm:px-6 lg:px-8 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200"
        >
            <div class="sm:mx-auto sm:w-full sm:max-w-md">
                <div class="flex justify-center mb-4">
                    <BackButton to="/" label="Kembali ke Beranda" />
                </div>
                <div class="flex justify-center">
                    <FilmIcon class="w-12 h-12 text-blue-600" />
                </div>
                <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    Sign in to Anime Database
                </h2>
                <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">Admin access required</p>
            </div>

            <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div class="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form class="space-y-6" @submit.prevent="handleLogin">
                        <!-- Email Field -->
                        <div>
                            <label
                                for="emailOrUsername"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Email atau Username
                            </label>
                            <div class="mt-1">
                                <input
                                    id="emailOrUsername"
                                    v-model="credentials.emailOrUsername"
                                    name="emailOrUsername"
                                    type="text"
                                    autocomplete="email"
                                    required
                                    class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                                    placeholder="Masukkan email atau username Anda"
                                    :disabled="authStore.isLoading"
                                />
                            </div>
                        </div>

                        <!-- Password Field -->
                        <div>
                            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Password
                            </label>
                            <div class="mt-1 relative">
                                <input
                                    id="password"
                                    v-model="credentials.password"
                                    name="password"
                                    :type="showPassword ? 'text' : 'password'"
                                    autocomplete="current-password"
                                    required
                                    class="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                                    placeholder="Enter your password"
                                    :disabled="authStore.isLoading"
                                />
                                <button
                                    type="button"
                                    class="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    @click="showPassword = !showPassword"
                                    :disabled="authStore.isLoading"
                                >
                                    <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400" />
                                    <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        <!-- Error Message -->
                        <div v-if="authStore.error" class="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                            <div class="flex">
                                <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
                                <div class="ml-3">
                                    <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
                                        {{ authStore.error }}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <!-- Submit Button -->
                        <div>
                            <button
                                type="submit"
                                class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                :disabled="authStore.isLoading || !credentials.emailOrUsername || !credentials.password"
                            >
                                <span
                                    v-if="authStore.isLoading"
                                    class="absolute left-0 inset-y-0 flex items-center pl-3"
                                >
                                    <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                </span>
                                {{ authStore.isLoading ? "Signing in..." : "Sign in" }}
                            </button>
                        </div>
                    </form>

                    <!-- Register Link -->
                    <div class="mt-6">
                        <div class="relative">
                            <div class="absolute inset-0 flex items-center">
                                <div class="w-full border-t border-gray-300 dark:border-gray-600" />
                            </div>
                            <div class="relative flex justify-center text-sm">
                                <span class="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                                    >Don't have an account?</span
                                >
                            </div>
                        </div>

                        <div class="mt-4">
                            <NuxtLink
                                to="/register"
                                class="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Create an account
                            </NuxtLink>
                        </div>
                    </div>

                    <!-- Forgot Password Link -->
                    <div class="mt-6">
                        <div class="text-center">
                            <button
                                type="button"
                                @click="showForgotPassword = true"
                                class="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                :disabled="authStore.isLoading"
                            >
                                Lupa Password?
                            </button>
                        </div>
                    </div>

                    <!-- Forgot Password Modal -->
                    <div
                        v-if="showForgotPassword"
                        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
                        @click="showForgotPassword = false"
                    >
                        <div
                            class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800"
                            @click.stop
                        >
                            <div class="mt-3">
                                <div class="flex items-center justify-between mb-4">
                                    <h3 class="text-lg font-medium text-gray-900 dark:text-white">Reset Password</h3>
                                    <button
                                        @click="showForgotPassword = false"
                                        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    >
                                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M6 18L18 6M6 6l12 12"
                                            ></path>
                                        </svg>
                                    </button>
                                </div>

                                <div v-if="!resetEmailSent">
                                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        Masukkan email Anda dan kami akan mengirimkan link untuk reset password.
                                    </p>

                                    <form @submit.prevent="handleForgotPassword">
                                        <div class="mb-4">
                                            <label
                                                for="reset-email"
                                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                            >
                                                Email
                                            </label>
                                            <input
                                                id="reset-email"
                                                v-model="resetEmail"
                                                type="email"
                                                required
                                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                                placeholder="Masukkan email Anda"
                                                :disabled="isResetting"
                                            />
                                        </div>

                                        <div
                                            v-if="resetError"
                                            class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
                                        >
                                            <p class="text-sm text-red-600 dark:text-red-400">{{ resetError }}</p>
                                        </div>

                                        <div class="flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                @click="showForgotPassword = false"
                                                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md"
                                                :disabled="isResetting"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                                                :disabled="isResetting || !resetEmail"
                                            >
                                                <span v-if="isResetting" class="flex items-center">
                                                    <div
                                                        class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
                                                    ></div>
                                                    Mengirim...
                                                </span>
                                                <span v-else>Kirim Link Reset</span>
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                <!-- Success state removed since we redirect immediately -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <template #fallback>
            <div class="flex flex-col justify-center py-12 sm:px-6 lg:px-8 min-h-screen bg-gray-50 dark:bg-gray-900">
                <div class="sm:mx-auto sm:w-full sm:max-w-md">
                    <div class="flex justify-center">
                        <div class="w-12 h-12 bg-blue-600 rounded-lg animate-pulse"></div>
                    </div>
                    <div class="mt-6 text-center">
                        <div class="h-8 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mx-auto w-64"></div>
                    </div>
                    <div class="mt-2 text-center">
                        <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mx-auto w-32"></div>
                    </div>
                </div>
                <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div class="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <div class="space-y-6">
                            <div class="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            <div class="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            <div class="h-10 bg-blue-200 dark:bg-blue-800 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </ClientOnly>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "~/stores/auth";
import { FilmIcon, EyeIcon, EyeSlashIcon, ExclamationTriangleIcon } from "@heroicons/vue/24/outline";

// Meta
definePageMeta({
    layout: false,
    middleware: "guest"
});

useSeoMeta({
    title: "Login - Anime Database",
    description: "Sign in to access the Anime Database admin panel"
});

const router = useRouter();
const authStore = useAuthStore();

// Reactive state
const credentials = ref({
    emailOrUsername: "",
    password: ""
});
const showPassword = ref(false);

// Forgot password state
const showForgotPassword = ref(false);
const resetEmail = ref("");
// Removed resetEmailSent since we redirect immediately
const isResetting = ref(false);
const resetError = ref("");

// Methods
const handleLogin = async () => {
    try {
        const result = await authStore.login(credentials.value);
        if (result.success) {
            // Reset form after successful login
            credentials.value = {
                emailOrUsername: "",
                password: ""
            };
            router.push("/");
        }
        // Jika login gagal, error akan ditampilkan melalui authStore.error
    } catch (error) {
        // Error handling is done in the store
    }
};

// Forgot password handler
const handleForgotPassword = async () => {
    if (!resetEmail.value) return;

    isResetting.value = true;
    resetError.value = "";

    try {
        const { client: supabase } = useSupabase();

        // Send reset password email with OTP token (no redirectTo)
        const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.value);

        if (error) {
            throw error;
        }

        // Redirect to reset-password page with email parameter
        router.push({
            path: "/reset-password",
            query: { email: resetEmail.value }
        });
    } catch (error: any) {
        console.error("Error sending reset email:", error);
        resetError.value = error.message || "Terjadi kesalahan saat mengirim email reset password";
    } finally {
        isResetting.value = false;
    }
};

// Redirect if already authenticated
onMounted(() => {
    if (authStore.isAuthenticated) {
        router.push("/");
    }
});
</script>

<style scoped>
/* Additional styles if needed */
</style>
