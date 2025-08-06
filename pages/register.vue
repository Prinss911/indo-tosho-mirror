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
                    {{ currentStep === "register" ? "Create your account" : "Verify your email" }}
                </h2>
                <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    {{
                        currentStep === "register"
                            ? "Join the Anime Database community"
                            : "Masukkan kode verifikasi dari email Anda"
                    }}
                </p>
            </div>

            <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div class="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <!-- Loading State -->
                    <div v-if="isCheckingRegistration" class="text-center py-8">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Checking registration status...</p>
                    </div>

                    <!-- Registration Disabled Notice -->
                    <div v-else-if="!registrationEnabled" class="text-center py-8">
                        <div class="mb-4">
                            <svg
                                class="mx-auto h-12 w-12 text-red-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
                                ></path>
                            </svg>
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Registrasi Sedang Ditutup
                        </h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            Maaf, pendaftaran akun baru sedang tidak tersedia saat ini. Silakan coba lagi nanti atau
                            hubungi administrator jika Anda memerlukan bantuan.
                        </p>
                        <div class="space-y-3">
                            <NuxtLink
                                to="/login"
                                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Login dengan Akun Existing
                            </NuxtLink>
                            <div>
                                <NuxtLink
                                    to="/"
                                    class="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    Kembali ke Beranda
                                </NuxtLink>
                            </div>
                        </div>
                    </div>

                    <!-- Step 1: Registration Form -->
                    <div v-else-if="currentStep === 'register'">
                        <form class="space-y-6" @submit.prevent="handleRegister">
                            <!-- Username Field -->
                            <div>
                                <label
                                    for="username"
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Username
                                </label>
                                <div class="mt-1">
                                    <input
                                        id="username"
                                        v-model="formData.username"
                                        name="username"
                                        type="text"
                                        autocomplete="username"
                                        required
                                        class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                                        placeholder="Choose a username"
                                        :disabled="isLoading"
                                        @input="formData.username = sanitizeUsername($event.target.value)"
                                    />
                                </div>
                                <p v-if="errors.username" class="mt-1 text-sm text-red-600 dark:text-red-400">
                                    {{ errors.username }}
                                </p>
                            </div>

                            <!-- Email Field -->
                            <div>
                                <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email Address
                                </label>
                                <div class="mt-1 relative">
                                    <input
                                        id="email"
                                        v-model="formData.email"
                                        name="email"
                                        type="email"
                                        autocomplete="email"
                                        required
                                        class="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                                        :class="{
                                            'border-red-500 focus:ring-red-500 focus:border-red-500': errors.email,
                                            'border-green-500 focus:ring-green-500 focus:border-green-500':
                                                emailCheckStatus === 'available' && formData.email,
                                            'border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500':
                                                emailCheckStatus === 'checking'
                                        }"
                                        placeholder="Enter your email"
                                        :disabled="isLoading"
                                        @blur="checkEmailExists"
                                        @input="onEmailInput"
                                    />
                                    <!-- Email status indicator -->
                                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <div
                                            v-if="emailCheckStatus === 'checking'"
                                            class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"
                                        ></div>
                                        <svg
                                            v-else-if="emailCheckStatus === 'available'"
                                            class="h-5 w-5 text-green-500"
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
                                        <svg
                                            v-else-if="emailCheckStatus === 'exists'"
                                            class="h-5 w-5 text-red-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M6 18L18 6M6 6l12 12"
                                            ></path>
                                        </svg>
                                    </div>
                                </div>
                                <p v-if="errors.email" class="mt-1 text-sm text-red-600 dark:text-red-400">
                                    {{ errors.email }}
                                </p>
                                <p
                                    v-else-if="emailCheckStatus === 'available' && formData.email"
                                    class="mt-1 text-sm text-green-600 dark:text-green-400"
                                >
                                    Email tersedia untuk digunakan
                                </p>
                                <p
                                    v-else-if="emailCheckStatus === 'exists'"
                                    class="mt-1 text-sm text-red-600 dark:text-red-400"
                                >
                                    Email sudah terdaftar.
                                    <NuxtLink to="/login" class="underline hover:text-red-500">Login di sini</NuxtLink>
                                </p>
                            </div>

                            <!-- Password Field -->
                            <div>
                                <label
                                    for="password"
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Password
                                </label>
                                <div class="mt-1 relative">
                                    <input
                                        id="password"
                                        v-model="formData.password"
                                        name="password"
                                        :type="showPassword ? 'text' : 'password'"
                                        autocomplete="new-password"
                                        required
                                        class="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                                        placeholder="Buat password yang kuat"
                                        :disabled="isLoading"
                                        @input="onPasswordInput"
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
                                <p v-if="errors.password" class="mt-1 text-sm text-red-600 dark:text-red-400">
                                    {{ errors.password }}
                                </p>

                                <!-- Password Strength Indicator -->
                                <div v-if="showPasswordStrength && formData.password" class="mt-2">
                                    <div class="flex items-center space-x-2">
                                        <span class="text-xs text-gray-600 dark:text-gray-400">Kekuatan Password:</span>
                                        <div class="flex space-x-1">
                                            <div
                                                class="h-1 w-6 rounded"
                                                :class="{
                                                    'bg-red-500': passwordStrength === 'weak',
                                                    'bg-yellow-500': passwordStrength === 'medium',
                                                    'bg-blue-500': passwordStrength === 'strong',
                                                    'bg-green-500': passwordStrength === 'very-strong'
                                                }"
                                            ></div>
                                            <div
                                                class="h-1 w-6 rounded"
                                                :class="{
                                                    'bg-gray-300': passwordStrength === 'weak',
                                                    'bg-yellow-500': passwordStrength === 'medium',
                                                    'bg-blue-500': passwordStrength === 'strong',
                                                    'bg-green-500': passwordStrength === 'very-strong'
                                                }"
                                            ></div>
                                            <div
                                                class="h-1 w-6 rounded"
                                                :class="{
                                                    'bg-gray-300': ['weak', 'medium'].includes(passwordStrength),
                                                    'bg-blue-500': passwordStrength === 'strong',
                                                    'bg-green-500': passwordStrength === 'very-strong'
                                                }"
                                            ></div>
                                            <div
                                                class="h-1 w-6 rounded"
                                                :class="{
                                                    'bg-gray-300': passwordStrength !== 'very-strong',
                                                    'bg-green-500': passwordStrength === 'very-strong'
                                                }"
                                            ></div>
                                        </div>
                                        <span
                                            class="text-xs"
                                            :class="{
                                                'text-red-600': passwordStrength === 'weak',
                                                'text-yellow-600': passwordStrength === 'medium',
                                                'text-blue-600': passwordStrength === 'strong',
                                                'text-green-600': passwordStrength === 'very-strong'
                                            }"
                                        >
                                            {{
                                                passwordStrength === "weak"
                                                    ? "Lemah"
                                                    : passwordStrength === "medium"
                                                      ? "Sedang"
                                                      : passwordStrength === "strong"
                                                        ? "Kuat"
                                                        : "Sangat Kuat"
                                            }}
                                        </span>
                                    </div>

                                    <!-- Password Requirements -->
                                    <div class="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                        <p>Password harus mengandung:</p>
                                        <ul class="list-disc list-inside mt-1 space-y-1">
                                            <li
                                                :class="
                                                    formData.password.length >= 8 ? 'text-green-600' : 'text-red-600'
                                                "
                                            >
                                                Minimal 8 karakter
                                            </li>
                                            <li
                                                :class="
                                                    /[a-z]/.test(formData.password) ? 'text-green-600' : 'text-red-600'
                                                "
                                            >
                                                Huruf kecil (a-z)
                                            </li>
                                            <li
                                                :class="
                                                    /[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-red-600'
                                                "
                                            >
                                                Huruf besar (A-Z)
                                            </li>
                                            <li :class="hasNumber ? 'text-green-600' : 'text-red-600'">Angka (0-9)</li>
                                            <li :class="hasSymbol ? 'text-green-600' : 'text-red-600'">
                                                Simbol (!@#$%^&* dll)
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <!-- Confirm Password Field -->
                            <div>
                                <label
                                    for="confirmPassword"
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Confirm Password
                                </label>
                                <div class="mt-1 relative">
                                    <input
                                        id="confirmPassword"
                                        v-model="formData.confirmPassword"
                                        name="confirmPassword"
                                        :type="showConfirmPassword ? 'text' : 'password'"
                                        autocomplete="new-password"
                                        required
                                        class="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                                        placeholder="Konfirmasi password Anda"
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
                                <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600 dark:text-red-400">
                                    {{ errors.confirmPassword }}
                                </p>
                            </div>

                            <!-- Terms and Conditions -->
                            <div class="flex items-center">
                                <input
                                    id="acceptTerms"
                                    v-model="formData.acceptTerms"
                                    name="acceptTerms"
                                    type="checkbox"
                                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                                    :disabled="isLoading"
                                />
                                <label for="acceptTerms" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                    I agree to the
                                    <a
                                        href="#"
                                        class="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                        >Terms and Conditions</a
                                    >
                                    and
                                    <a
                                        href="#"
                                        class="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                        >Privacy Policy</a
                                    >
                                </label>
                            </div>
                            <p v-if="errors.acceptTerms" class="mt-1 text-sm text-red-600 dark:text-red-400">
                                {{ errors.acceptTerms }}
                            </p>

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
                            <div v-if="success" class="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
                                <div class="flex">
                                    <CheckCircleIcon class="h-5 w-5 text-green-400" />
                                    <div class="ml-3">
                                        <h3 class="text-sm font-medium text-green-800 dark:text-green-200">
                                            {{ success }}
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            <!-- Submit Button -->
                            <div>
                                <button
                                    type="submit"
                                    class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    :disabled="isLoading || !isFormValid"
                                >
                                    <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                                        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    </span>
                                    {{ isLoading ? "Membuat akun..." : "Buat Akun" }}
                                </button>
                            </div>
                        </form>

                        <!-- Login Link -->
                        <div class="mt-6">
                            <div class="relative">
                                <div class="absolute inset-0 flex items-center">
                                    <div class="w-full border-t border-gray-300 dark:border-gray-600" />
                                </div>
                                <div class="relative flex justify-center text-sm">
                                    <span class="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                                        >Sudah punya akun?</span
                                    >
                                </div>
                            </div>

                            <div class="mt-4">
                                <NuxtLink
                                    to="/login"
                                    class="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    Masuk di sini
                                </NuxtLink>
                            </div>
                        </div>
                    </div>

                    <!-- Step 2: Email Verification -->
                    <div v-else-if="currentStep === 'verify'">
                        <form class="space-y-6" @submit.prevent="handleTokenVerification">
                            <!-- Display registered email -->
                            <div class="mb-4">
                                <p class="text-sm text-gray-600 dark:text-gray-400">
                                    Kode verifikasi telah dikirim ke:
                                    <strong class="text-gray-900 dark:text-white">{{ registeredEmail }}</strong>
                                </p>
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
                                    :disabled="isLoading || !verificationToken || verificationToken.length !== 6"
                                >
                                    <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                                        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    </span>
                                    {{ isLoading ? "Memverifikasi..." : "Verifikasi & Buat Akun" }}
                                </button>
                            </div>
                        </form>

                        <!-- Resend Token -->
                        <div class="mt-6 text-center">
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                                Tidak menerima kode?
                                <button
                                    type="button"
                                    @click="handleResendToken"
                                    class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                    :disabled="isLoading"
                                >
                                    Kirim ulang
                                </button>
                            </p>
                        </div>
                    </div>

                    <!-- Step 3: Success State -->
                    <div v-else-if="currentStep === 'success'" class="text-center">
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
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Akun Berhasil Dibuat!</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Selamat! Akun Anda telah berhasil dibuat dan diverifikasi. Silakan login untuk mulai
                            menggunakan aplikasi.
                        </p>
                        <NuxtLink
                            to="/login"
                            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Login Sekarang
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </div>
    </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "~/stores/auth";
import { FilmIcon, EyeIcon, EyeSlashIcon, ExclamationTriangleIcon, CheckCircleIcon } from "@heroicons/vue/24/outline";
import { sanitizeInput, sanitizeEmail, sanitizeUsername } from "~/utils/input-sanitizer";

// Meta
definePageMeta({
    layout: false,
    middleware: "guest"
});

useSeoMeta({
    title: "Register - Anime Database",
    description: "Create an account to join the Anime Database community"
});

const router = useRouter();
const authStore = useAuthStore();
const supabase = useSupabaseClient();

// Registration status
const registrationEnabled = ref(true);
const isCheckingRegistration = ref(true);

// Reactive state
const formData = ref({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false
});

const passwordStrength = ref<"weak" | "medium" | "strong" | "very-strong">("weak");
const showPasswordStrength = ref(false);

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const isLoading = ref(false);
const error = ref("");
const success = ref("");
const emailCheckStatus = ref(""); // 'checking', 'available', 'exists', ''
const emailCheckTimeout = ref(null);
const errors = ref({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: ""
});

const securityWarnings = ref<string[]>([]);

// Token verification state
const currentStep = ref("register");
const verificationToken = ref("");
const registeredEmail = ref("");
const tempUserData = ref(null);

// Computed
const isFormValid = computed(() => {
    // Enhanced validation for form submission
    return (
        formData.value.username &&
        formData.value.email &&
        formData.value.password &&
        formData.value.confirmPassword &&
        formData.value.acceptTerms &&
        emailCheckStatus.value === "available" &&
        !Object.values(errors.value).some(error => error) &&
        passwordStrength.value !== "weak"
    );
});

const hasNumber = computed(() => /\d/.test(formData.value.password));
const hasSymbol = computed(() => {
    const symbolRegex = new RegExp("[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]");
    return symbolRegex.test(formData.value.password);
});

// Email validation methods
const checkEmailExists = async () => {
    if (!formData.value.email || !formData.value.email.includes("@")) {
        emailCheckStatus.value = "";
        return;
    }

    emailCheckStatus.value = "checking";

    try {
        // Use the API endpoint instead of direct Supabase query
        const response = await $fetch("/api/auth/check-email-exists", {
            method: "GET",
            query: {
                email: formData.value.email
            }
        });

        console.log("📧 Email check response:", response);

        if (response.exists) {
            // Email exists
            emailCheckStatus.value = "exists";
            errors.value.email = "Email sudah terdaftar";
        } else {
            // Email is available
            emailCheckStatus.value = "available";
            errors.value.email = "";
        }
    } catch (err: any) {
        console.error("Email check error:", err);
        emailCheckStatus.value = "error";
        // Don't show error to user for email check, just reset status
    }
};

const onEmailInput = () => {
    // Sanitize email input
    const sanitizedEmail = sanitizeEmail(formData.value.email);
    if (sanitizedEmail !== formData.value.email) {
        formData.value.email = sanitizedEmail;
    }

    // Clear previous timeout
    if (emailCheckTimeout.value) {
        clearTimeout(emailCheckTimeout.value);
    }

    // Reset status
    emailCheckStatus.value = "";
    errors.value.email = "";

    // Set new timeout for debounced checking
    emailCheckTimeout.value = setTimeout(() => {
        checkEmailExists();
    }, 500);
};

// Password input handler
const onPasswordInput = () => {
    showPasswordStrength.value = formData.value.password.length > 0;

    if (formData.value.password.length === 0) {
        passwordStrength.value = "weak";
        errors.value.password = "";
        return;
    }

    // Simple client-side validation
    const password = formData.value.password;

    if (password.length < 8) {
        errors.value.password = "Password harus minimal 8 karakter";
        passwordStrength.value = "weak";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(password)) {
        errors.value.password = "Password harus mengandung huruf besar, huruf kecil, angka, dan simbol";
        passwordStrength.value = "medium";
    } else {
        errors.value.password = "";
        passwordStrength.value = "strong";
    }
};

// Methods
const validateForm = () => {
    errors.value = {
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        acceptTerms: ""
    };

    // Username validation
    const sanitizedUsername = sanitizeUsername(formData.value.username);
    if (sanitizedUsername.length < 3) {
        errors.value.username = "Username must be at least 3 characters long";
    } else if (!/^[a-zA-Z0-9_]+$/.test(sanitizedUsername)) {
        errors.value.username = "Username can only contain letters, numbers, and underscores";
    }

    // Email validation
    const sanitizedEmail = sanitizeEmail(formData.value.email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
        errors.value.email = "Please enter a valid email address";
    }

    // Enhanced password validation
    if (!formData.value.password) {
        errors.value.password = "Password diperlukan";
    } else if (formData.value.password.length < 8) {
        errors.value.password = "Password harus minimal 8 karakter";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(formData.value.password)) {
        errors.value.password = "Password harus mengandung huruf besar, huruf kecil, angka, dan simbol";
    } else {
        errors.value.password = "";
    }

    // Confirm password validation
    if (formData.value.password !== formData.value.confirmPassword) {
        errors.value.confirmPassword = "Passwords do not match";
    }

    // Terms validation
    if (!formData.value.acceptTerms) {
        errors.value.acceptTerms = "Anda harus menyetujui syarat dan ketentuan";
    }

    return !Object.values(errors.value).some(error => error);
};

const handleRegister = async () => {
    if (!isFormValid.value) {
        error.value = "Silakan lengkapi semua field dengan benar";
        return;
    }

    error.value = "";
    success.value = "";
    securityWarnings.value = [];

    // Sanitize form data before validation
    formData.value.username = sanitizeUsername(formData.value.username);
    formData.value.email = sanitizeEmail(formData.value.email);
    // Note: Password tidak disanitasi karena bisa mengubah password yang valid

    // Final form validation
    if (Object.values(errors.value).some(error => error)) {
        error.value = "Silakan perbaiki kesalahan pada form";
        return;
    }

    // Check rate limiting first
    try {
        const rateLimitCheck = await $fetch("/api/auth/check-rate-limit", {
            method: "POST",
            body: {
                identifier: formData.value.email,
                type: "register"
            }
        });

        if (!rateLimitCheck.allowed) {
            error.value = "Terlalu banyak percobaan registrasi. Silakan coba lagi nanti.";
            return;
        }
    } catch {
        // Continue if rate limit check fails
    }

    // Check email status before proceeding
    if (emailCheckStatus.value === "exists") {
        error.value = "Email sudah terdaftar. Silakan gunakan email lain atau login jika Anda sudah memiliki akun.";
        return;
    }

    if (emailCheckStatus.value !== "available") {
        // Force check email if status is not clear
        await checkEmailExists();
        if (emailCheckStatus.value === "exists") {
            error.value = "Email sudah terdaftar. Silakan gunakan email lain atau login jika Anda sudah memiliki akun.";
            return;
        }
    }

    isLoading.value = true;

    try {
        // Double check if email already exists in profiles table
        const { data: existingUser, error: checkError } = await supabase
            .from("profiles")
            .select("email")
            .eq("email", formData.value.email)
            .single();

        if (checkError && checkError.code !== "PGRST116") {
            // PGRST116 means no rows found, which is what we want
            throw new Error("Gagal memeriksa email. Silakan coba lagi.");
        }

        if (existingUser) {
            emailCheckStatus.value = "exists";
            throw new Error(
                "Email sudah terdaftar. Silakan gunakan email lain atau login jika Anda sudah memiliki akun."
            );
        }

        // Check if username already exists
        const { data: existingUsername, error: usernameCheckError } = await supabase
            .from("profiles")
            .select("username")
            .eq("username", formData.value.username)
            .single();

        if (usernameCheckError && usernameCheckError.code !== "PGRST116") {
            throw new Error("Gagal memeriksa username. Silakan coba lagi.");
        }

        if (existingUsername) {
            throw new Error("Username sudah digunakan. Silakan pilih username lain.");
        }

        // Store user data temporarily
        tempUserData.value = {
            username: formData.value.username,
            email: formData.value.email,
            password: formData.value.password
        };

        // Final password strength check
        if (passwordStrength.value === "weak") {
            error.value = "Password terlalu lemah. Silakan gunakan password yang lebih kuat.";
            return;
        }

        // Send verification email using Supabase Auth
        const { data, error: signUpError } = await supabase.auth.signUp({
            email: sanitizeEmail(formData.value.email),
            password: formData.value.password, // Password tidak disanitasi
            options: {
                emailRedirectTo: `${window.location.origin}/register`,
                data: {
                    username: sanitizeUsername(formData.value.username)
                }
            }
        });

        if (signUpError) {
            // Sanitize error messages
            if (signUpError.message.includes("User already registered")) {
                emailCheckStatus.value = "exists";
                throw new Error(
                    "Email sudah terdaftar. Silakan gunakan email lain atau login jika Anda sudah memiliki akun."
                );
            } else if (signUpError.message.includes("Invalid email")) {
                throw new Error("Format email tidak valid. Silakan periksa kembali email Anda.");
            } else if (signUpError.message.includes("Password should be at least")) {
                throw new Error("Password tidak memenuhi persyaratan keamanan.");
            } else if (signUpError.message.includes("Signup disabled")) {
                throw new Error("Registrasi sedang ditutup sementara.");
            } else {
                // Don't expose internal errors
                throw new Error("Terjadi kesalahan saat registrasi. Silakan coba lagi.");
            }
        }

        // Set registered email and move to verification step
        registeredEmail.value = formData.value.email;
        currentStep.value = "verify";
    } catch (err: any) {
        error.value = err.message || "Registrasi gagal. Silakan coba lagi.";
    } finally {
        isLoading.value = false;
    }
};

// Handle token verification
const handleTokenVerification = async () => {
    if (!verificationToken.value || verificationToken.value.length !== 6) {
        error.value = "Please enter a valid 6-digit verification code";
        return;
    }

    isLoading.value = true;
    error.value = "";

    try {
        // Verify the OTP token
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
            email: registeredEmail.value,
            token: verificationToken.value,
            type: "signup"
        });

        if (verifyError) {
            throw verifyError;
        }

        if (data.user) {
            // Create user profile in the profiles table
            const { error: profileError } = await supabase.from("profiles").upsert({
                id: data.user.id,
                username: tempUserData.value.username,
                email: data.user.email,
                role: "user"
            });

            if (profileError) {
                console.error("Profile creation error:", profileError);
                // Don't throw here as the user is already created
            }

            // Move to success step
            currentStep.value = "success";
        }
    } catch (err: any) {
        if (err.message.includes("Token has expired")) {
            error.value = "Verification code has expired. Please request a new one.";
        } else if (err.message.includes("Invalid token")) {
            error.value = "Invalid verification code. Please check and try again.";
        } else {
            error.value = err.message || "Verification failed. Please try again.";
        }
    } finally {
        isLoading.value = false;
    }
};

// Handle resend token
const handleResendToken = async () => {
    if (!registeredEmail.value) {
        error.value = "No email found. Please start registration again.";
        return;
    }

    isLoading.value = true;
    error.value = "";

    try {
        const { error: resendError } = await supabase.auth.resend({
            type: "signup",
            email: registeredEmail.value,
            options: {
                emailRedirectTo: `${window.location.origin}/register`
            }
        });

        if (resendError) {
            throw resendError;
        }

        success.value = "Verification code has been resent to your email.";

        // Clear success message after 3 seconds
        setTimeout(() => {
            success.value = "";
        }, 3000);
    } catch (err: any) {
        error.value = err.message || "Failed to resend verification code.";
    } finally {
        isLoading.value = false;
    }
};

// Format token input to only allow numbers
const formatTokenInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const value = target.value.replace(/\D/g, ""); // Remove non-digits
    verificationToken.value = value.slice(0, 6); // Limit to 6 digits
};

// Check registration status
const checkRegistrationStatus = async () => {
    try {
        const response = await $fetch("/api/settings/registration");
        if (response.success) {
            registrationEnabled.value = response.enabled;
        }
    } catch (error) {
        console.error("Error checking registration status:", error);
        // Default to enabled on error
        registrationEnabled.value = true;
    } finally {
        isCheckingRegistration.value = false;
    }
};

// Redirect if already authenticated
onMounted(async () => {
    if (authStore.isAuthenticated) {
        router.push("/");
        return;
    }

    // Check registration status
    await checkRegistrationStatus();
});
</script>

<style scoped>
/* Additional styles if needed */
</style>
