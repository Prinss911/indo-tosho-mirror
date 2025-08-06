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
                <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">Reset Password</h2>
                <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    {{
                        currentStep === "token"
                            ? "Masukkan kode verifikasi dari email Anda"
                            : "Masukkan password baru Anda"
                    }}
                </p>
            </div>

            <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div class="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <!-- Step 1: Token Verification -->
                    <div v-if="currentStep === 'token'">
                        <form class="space-y-6" @submit.prevent="handleTokenVerification">
                            <!-- Email Input Field (if needed) -->
                            <div v-if="showEmailInput">
                                <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email
                                </label>
                                <div class="mt-1">
                                    <input
                                        id="email"
                                        v-model="userEmail"
                                        name="email"
                                        type="email"
                                        autocomplete="email"
                                        required
                                        class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                                        placeholder="Masukkan email Anda"
                                        :disabled="isLoading"
                                    />
                                </div>
                                <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    Email yang digunakan untuk menerima kode verifikasi
                                </p>
                            </div>

                            <!-- Display email if provided via query -->
                            <div v-else-if="userEmail" class="mb-4">
                                <p class="text-sm text-gray-600 dark:text-gray-400">
                                    Kode verifikasi akan dikirim ke:
                                    <strong class="text-gray-900 dark:text-white">{{ userEmail }}</strong>
                                </p>
                                <button
                                    type="button"
                                    @click="showEmailInput = true"
                                    class="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                    :disabled="isLoading"
                                >
                                    Ubah email
                                </button>
                            </div>

                            <!-- Token Input Field -->
                            <div>
                                <label for="token" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Kode Verifikasi (6 digit)
                                </label>
                                <div class="mt-1">
                                    <input
                                        id="token"
                                        v-model="verificationToken"
                                        name="token"
                                        type="text"
                                        maxlength="6"
                                        pattern="[0-9]{6}"
                                        autocomplete="one-time-code"
                                        required
                                        class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm text-center text-2xl tracking-widest"
                                        placeholder="123456"
                                        :disabled="isLoading"
                                        @input="formatTokenInput"
                                    />
                                </div>
                                <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    Masukkan kode 6 digit yang dikirim ke email Anda
                                </p>
                            </div>

                            <!-- Error Message -->
                            <div v-if="error" class="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                                <div class="flex">
                                    <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
                                    <div class="ml-3">
                                        <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
                                            {{ error }}
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            <!-- Submit Button -->
                            <div>
                                <button
                                    type="submit"
                                    class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    :disabled="
                                        isLoading || !verificationToken || verificationToken.length !== 6 || !userEmail
                                    "
                                >
                                    <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                                        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    </span>
                                    {{ isLoading ? "Memverifikasi..." : "Verifikasi Kode" }}
                                </button>
                            </div>
                        </form>

                        <!-- Resend Token -->
                        <div class="mt-6 text-center">
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                                Tidak menerima kode?
                                <button
                                    type="button"
                                    @click="showResendForm = true"
                                    class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                    :disabled="isLoading"
                                >
                                    Kirim ulang
                                </button>
                            </p>
                        </div>
                    </div>

                    <!-- Step 2: Password Reset Form -->
                    <div v-else-if="currentStep === 'password' && !resetSuccess">
                        <form class="space-y-6" @submit.prevent="handleResetPassword">
                            <!-- New Password Field -->
                            <div>
                                <label
                                    for="password"
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Password Baru
                                </label>
                                <div class="mt-1 relative">
                                    <input
                                        id="password"
                                        v-model="newPassword"
                                        name="password"
                                        :type="showPassword ? 'text' : 'password'"
                                        autocomplete="new-password"
                                        required
                                        minlength="6"
                                        class="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                                        placeholder="Masukkan password baru (minimal 6 karakter)"
                                        :disabled="isLoading"
                                    />
                                    <button
                                        type="button"
                                        class="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        @click="showPassword = !showPassword"
                                        :disabled="isLoading"
                                    >
                                        <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400" />
                                        <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            <!-- Confirm Password Field -->
                            <div>
                                <label
                                    for="confirmPassword"
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Konfirmasi Password Baru
                                </label>
                                <div class="mt-1 relative">
                                    <input
                                        id="confirmPassword"
                                        v-model="confirmPassword"
                                        name="confirmPassword"
                                        :type="showConfirmPassword ? 'text' : 'password'"
                                        autocomplete="new-password"
                                        required
                                        minlength="6"
                                        class="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                                        placeholder="Konfirmasi password baru"
                                        :disabled="isLoading"
                                    />
                                    <button
                                        type="button"
                                        class="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        @click="showConfirmPassword = !showConfirmPassword"
                                        :disabled="isLoading"
                                    >
                                        <EyeIcon v-if="!showConfirmPassword" class="h-5 w-5 text-gray-400" />
                                        <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            <!-- Password Validation -->
                            <div
                                v-if="newPassword && confirmPassword && newPassword !== confirmPassword"
                                class="rounded-md bg-red-50 dark:bg-red-900/20 p-4"
                            >
                                <div class="flex">
                                    <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
                                    <div class="ml-3">
                                        <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
                                            Password tidak cocok
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            <!-- Error Message -->
                            <div v-if="error" class="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                                <div class="flex">
                                    <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
                                    <div class="ml-3">
                                        <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
                                            {{ error }}
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            <!-- Submit Button -->
                            <div>
                                <button
                                    type="submit"
                                    class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    :disabled="
                                        isLoading ||
                                        !newPassword ||
                                        !confirmPassword ||
                                        newPassword !== confirmPassword ||
                                        newPassword.length < 6
                                    "
                                >
                                    <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                                        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    </span>
                                    {{ isLoading ? "Mengupdate Password..." : "Update Password" }}
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Success State -->
                    <div v-else-if="resetSuccess" class="text-center">
                        <div class="mb-4">
                            <svg
                                class="mx-auto h-12 w-12 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M5 13l4 4L19 7"
                                ></path>
                            </svg>
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Password Berhasil Diupdate!
                        </h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Password Anda telah berhasil diupdate. Silakan login dengan password baru Anda.
                        </p>
                        <NuxtLink
                            to="/login"
                            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Login Sekarang
                        </NuxtLink>
                    </div>

                    <!-- Resend Token Modal -->
                    <div
                        v-if="showResendForm"
                        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
                        @click="showResendForm = false"
                    >
                        <div
                            class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800"
                            @click.stop
                        >
                            <div class="mt-3">
                                <div class="flex items-center justify-between mb-4">
                                    <h3 class="text-lg font-medium text-gray-900 dark:text-white">Kirim Ulang Kode</h3>
                                    <button
                                        @click="showResendForm = false"
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

                                <form @submit.prevent="handleResendToken">
                                    <div class="mb-4">
                                        <label
                                            for="resend-email"
                                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                        >
                                            Email
                                        </label>
                                        <input
                                            id="resend-email"
                                            v-model="resendEmail"
                                            type="email"
                                            required
                                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="Masukkan email Anda"
                                            :disabled="isResending"
                                        />
                                    </div>

                                    <div
                                        v-if="resendError"
                                        class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
                                    >
                                        <p class="text-sm text-red-600 dark:text-red-400">{{ resendError }}</p>
                                    </div>

                                    <div
                                        v-if="resendSuccess"
                                        class="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md"
                                    >
                                        <p class="text-sm text-green-600 dark:text-green-400">
                                            Kode verifikasi baru telah dikirim ke email Anda!
                                        </p>
                                    </div>

                                    <div class="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            @click="showResendForm = false"
                                            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md"
                                            :disabled="isResending"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                                            :disabled="isResending || !resendEmail"
                                        >
                                            <span v-if="isResending" class="flex items-center">
                                                <div
                                                    class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
                                                ></div>
                                                Mengirim...
                                            </span>
                                            <span v-else>Kirim Kode</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </ClientOnly>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { FilmIcon, EyeIcon, EyeSlashIcon, ExclamationTriangleIcon } from "@heroicons/vue/24/outline";

// Meta
definePageMeta({
    layout: false,
    middleware: "guest"
});

useSeoMeta({
    title: "Reset Password - Anime Database",
    description: "Reset your password for Anime Database"
});

const router = useRouter();
const route = useRoute();

// Reactive state
const currentStep = ref<"token" | "password">("token");
const verificationToken = ref("");
const userEmail = ref("");
const showEmailInput = ref(false);
const newPassword = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const isLoading = ref(false);
const error = ref("");
const resetSuccess = ref(false);

// Resend token state
const showResendForm = ref(false);
const resendEmail = ref("");
const isResending = ref(false);
const resendError = ref("");
const resendSuccess = ref(false);

// Store verified session for password update
let verifiedSession: any = null;

// Initialize email from query parameter
onMounted(() => {
    const emailFromQuery = route.query.email as string;
    if (emailFromQuery) {
        userEmail.value = emailFromQuery;
        showEmailInput.value = false; // Hide email input if email is provided via query
    } else {
        showEmailInput.value = true; // Show email input if no email in query
    }

    // Check if there's a recovery token in the URL (direct link from email)
    const recoveryToken = route.query.token as string;
    if (recoveryToken) {
        verificationToken.value = recoveryToken;
        currentStep.value = "token";
    }
});

// Methods
const formatTokenInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    // Only allow numbers
    target.value = target.value.replace(/[^0-9]/g, "");
    verificationToken.value = target.value;
};

const handleTokenVerification = async () => {
    if (verificationToken.value.length !== 6) {
        error.value = "Kode verifikasi harus 6 digit";
        return;
    }

    if (!userEmail.value) {
        error.value = "Email diperlukan untuk verifikasi. Silakan masukkan email Anda.";
        showEmailInput.value = true;
        return;
    }

    isLoading.value = true;
    error.value = "";

    try {
        const { client: supabase } = useSupabase();

        // Verify the OTP token with email
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
            email: userEmail.value,
            token: verificationToken.value,
            type: "recovery"
        });

        if (verifyError) {
            throw verifyError;
        }

        if (data.session) {
            verifiedSession = data.session;
            currentStep.value = "password";
        } else {
            throw new Error("Tidak dapat memverifikasi token");
        }
    } catch (err: any) {
        console.error("Error verifying token:", err);
        if (err.message.includes("Token has expired")) {
            error.value = "Kode verifikasi telah kedaluwarsa. Silakan minta kode baru.";
        } else if (err.message.includes("Invalid token")) {
            error.value = "Kode verifikasi tidak valid. Periksa kembali kode yang Anda masukkan.";
        } else {
            error.value = err.message || "Terjadi kesalahan saat memverifikasi kode";
        }
    } finally {
        isLoading.value = false;
    }
};

const handleResetPassword = async () => {
    if (newPassword.value !== confirmPassword.value) {
        error.value = "Password tidak cocok";
        return;
    }

    if (newPassword.value.length < 6) {
        error.value = "Password minimal 6 karakter";
        return;
    }

    if (!verifiedSession) {
        error.value = "Sesi tidak valid. Silakan verifikasi kode lagi.";
        currentStep.value = "token";
        return;
    }

    isLoading.value = true;
    error.value = "";

    try {
        const { client: supabase } = useSupabase();

        // Set the session first
        await supabase.auth.setSession(verifiedSession);

        // Update the password
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword.value
        });

        if (updateError) {
            throw updateError;
        }

        resetSuccess.value = true;
    } catch (err: any) {
        console.error("Error updating password:", err);
        error.value = err.message || "Terjadi kesalahan saat mengupdate password";
    } finally {
        isLoading.value = false;
    }
};

const handleResendToken = async () => {
    if (!resendEmail.value) return;

    isResending.value = true;
    resendError.value = "";
    resendSuccess.value = false;

    try {
        const { client: supabase } = useSupabase();

        const { error } = await supabase.auth.resetPasswordForEmail(resendEmail.value);

        if (error) {
            throw error;
        }

        resendSuccess.value = true;
        // Reset form after 3 seconds
        setTimeout(() => {
            showResendForm.value = false;
            resendEmail.value = "";
            resendSuccess.value = false;
        }, 3000);
    } catch (error: any) {
        console.error("Error sending reset email:", error);
        resendError.value = error.message || "Terjadi kesalahan saat mengirim email reset password";
    } finally {
        isResending.value = false;
    }
};

// Check if there's a token in URL (for direct access)
onMounted(async () => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");
        const type = urlParams.get("type");

        if (token && type === "recovery") {
            verificationToken.value = token;
            // Auto-verify if token is provided in URL
            await handleTokenVerification();
            // Clear URL parameters
            window.history.replaceState(null, "", window.location.pathname);
        }
    } catch (err) {
        console.error("Error checking URL parameters:", err);
    }
});
</script>

<style scoped>
/* Additional styles if needed */
</style>
