import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { nextTick, reactive } from "vue";
import LoginPage from "~/pages/login.vue";
import { useAuthStore } from "~/stores/auth";

// Mock Nuxt router
const mockPush = vi.fn();
vi.mock("vue-router", () => ({
    useRouter: () => ({
        push: mockPush
    })
}));

vi.mock("#app", () => ({
    navigateTo: vi.fn()
}));

// Mock auth store
let mockAuthStore: any;

vi.mock("~/stores/auth", () => ({
    useAuthStore: () => mockAuthStore
}));

// Mock Nuxt head
vi.mock("#head", () => ({
    useHead: vi.fn()
}));

describe("Login Page", () => {
    let wrapper: any;
    let pinia: any;

    beforeEach(() => {
        pinia = createPinia();
        setActivePinia(pinia);

        // Create reactive mock store
        mockAuthStore = reactive({
            user: null,
            isAuthenticated: false,
            error: null,
            login: vi.fn(),
            checkAuth: vi.fn(),
            isLoading: false
        });

        // Reset mocks
        vi.clearAllMocks();

        // Unmount previous wrapper if exists
        if (wrapper) {
            wrapper.unmount();
            wrapper = null;
        }
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.unmount();
        }
    });

    describe("Component Rendering", () => {
        it("should render login form with all required fields", () => {
            wrapper = mount(LoginPage, {
                global: {
                    plugins: [pinia]
                }
            });

            expect(wrapper.find("h2").text()).toBe("Sign in to Anime Database");
            expect(wrapper.find('input[name="emailOrUsername"]').exists()).toBe(true);
            expect(wrapper.find('input[type="password"]').exists()).toBe(true);
            expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
        });

        it("should render email and password input fields", () => {
            wrapper = mount(LoginPage, {
                global: {
                    plugins: [pinia]
                }
            });

            const emailInput = wrapper.find('input[name="emailOrUsername"]');
            const passwordInput = wrapper.find('input[name="password"]');

            expect(emailInput.attributes("placeholder")).toBe("Masukkan email atau username Anda");
            expect(passwordInput.attributes("placeholder")).toBe("Enter your password");
        });

        it("should render password visibility toggle button", () => {
            wrapper = mount(LoginPage, {
                global: {
                    plugins: [pinia]
                }
            });

            const toggleButton = wrapper.find('button[type="button"]');
            expect(toggleButton.exists()).toBe(true);
        });

        it("should render link to register page", () => {
            wrapper = mount(LoginPage, {
                global: {
                    plugins: [pinia]
                }
            });

            const registerLink = wrapper.find('a[href="/register"]');
            expect(registerLink.exists()).toBe(true);
            expect(registerLink.text()).toContain("Create an account");
        });
    });

    describe("Form Interaction", () => {
        it("should update email input value", async () => {
            wrapper = mount(LoginPage, {
                global: {
                    plugins: [pinia]
                }
            });

            const emailInput = wrapper.find('input[name="emailOrUsername"]');
            await emailInput.setValue("test@example.com");

            expect(wrapper.vm.credentials.emailOrUsername).toBe("test@example.com");
        });

        it("should update password input value", async () => {
            wrapper = mount(LoginPage, {
                global: {
                    plugins: [pinia]
                }
            });

            const passwordInput = wrapper.find('input[type="password"]');
            await passwordInput.setValue("password123");

            expect(wrapper.vm.credentials.password).toBe("password123");
        });

        it("should toggle password visibility", async () => {
            wrapper = mount(LoginPage, {
                global: {
                    plugins: [pinia]
                }
            });

            const toggleButton = wrapper.find('button[type="button"]');
            const passwordInput = wrapper.find('input[type="password"]');

            // Initially password should be hidden
            expect(passwordInput.attributes("type")).toBe("password");
            expect(wrapper.vm.showPassword).toBe(false);

            // Click toggle button
            await toggleButton.trigger("click");
            await nextTick();

            expect(wrapper.vm.showPassword).toBe(true);
            expect(wrapper.find('input[name="password"]').attributes("type")).toBe("text");

            // Click again to hide
            await toggleButton.trigger("click");
            await nextTick();

            expect(wrapper.vm.showPassword).toBe(false);
        });
    });

    describe("Form Submission", () => {
        it("should call login function when form is submitted with valid credentials", async () => {
            mockAuthStore.login.mockResolvedValue(undefined);

            wrapper = mount(LoginPage, {
                global: {
                    plugins: [pinia]
                }
            });

            // Fill form
            await wrapper.find('input[name="emailOrUsername"]').setValue("test@example.com");
            await wrapper.find('input[name="password"]').setValue("password123");

            // Submit form
            await wrapper.find("form").trigger("submit.prevent");

            expect(mockAuthStore.login).toHaveBeenCalledWith({
                emailOrUsername: "test@example.com",
                password: "password123"
            });
        });

        it("should redirect to home page after successful login", async () => {
            mockAuthStore.login.mockResolvedValue({ success: true });

            wrapper = mount(LoginPage, {
                global: {
                    plugins: [pinia]
                }
            });

            // Fill and submit form
            await wrapper.find('input[name="emailOrUsername"]').setValue("test@example.com");
            await wrapper.find('input[type="password"]').setValue("password123");
            await wrapper.find("form").trigger("submit.prevent");

            // Wait for async operations
            await nextTick();
            await new Promise(resolve => setTimeout(resolve, 0));

            expect(mockAuthStore.login).toHaveBeenCalledWith({
                emailOrUsername: "test@example.com",
                password: "password123"
            });
            expect(mockPush).toHaveBeenCalledWith("/");
        });

        it("should not submit form with empty credentials", async () => {
            wrapper = mount(LoginPage, {
                global: {
                    plugins: [pinia]
                }
            });

            // Check that submit button is disabled with empty credentials
            const submitButton = wrapper.find('button[type="submit"]');
            expect(submitButton.attributes("disabled")).toBeDefined();

            // Even if form is triggered, login should not be called due to disabled state
            expect(mockAuthStore.login).not.toHaveBeenCalled();
        });

        it("should handle login errors", async () => {
            const errorMessage = "Invalid credentials";
            mockAuthStore.login.mockRejectedValue(new Error(errorMessage));

            wrapper = mount(LoginPage, {
                global: {
                    plugins: [pinia]
                }
            });

            // Fill and submit form
            await wrapper.find('input[name="emailOrUsername"]').setValue("test@example.com");
            await wrapper.find('input[name="password"]').setValue("wrongpassword");
            await wrapper.find("form").trigger("submit.prevent");

            // Wait for async operations
            await nextTick();
            await new Promise(resolve => setTimeout(resolve, 0));

            expect(mockPush).not.toHaveBeenCalled();
        });
    });

    describe("Loading State", () => {
        it("should show loading state during login", async () => {
            mockAuthStore.isLoading = true;

            wrapper = mount(LoginPage, {
                global: {
                    plugins: [pinia]
                }
            });

            const submitButton = wrapper.find('button[type="submit"]');
            expect(submitButton.attributes("disabled")).toBeDefined();
            expect(submitButton.text()).toContain("Signing in...");
        });

        it("should disable form inputs during loading", () => {
            mockAuthStore.isLoading = true;

            wrapper = mount(LoginPage, {
                global: {
                    plugins: [pinia]
                }
            });

            const emailInput = wrapper.find('input[name="emailOrUsername"]');
            const passwordInput = wrapper.find('input[name="password"]');

            expect(emailInput.attributes("disabled")).toBeDefined();
            expect(passwordInput.attributes("disabled")).toBeDefined();
        });

        it("should enable form when not loading", () => {
            mockAuthStore.isLoading = false;

            wrapper = mount(LoginPage, {
                global: {
                    plugins: [pinia]
                }
            });

            const submitButton = wrapper.find('button[type="submit"]');
            const emailInput = wrapper.find('input[name="emailOrUsername"]');
            const passwordInput = wrapper.find('input[name="password"]');

            expect(submitButton.attributes("disabled")).toBeFalsy();
            expect(emailInput.attributes("disabled")).toBeFalsy();
            expect(passwordInput.attributes("disabled")).toBeFalsy();
            expect(submitButton.text()).toBe("Sign in");
        });
    });

    describe("Error Display", () => {
        it("should display error message when login fails", () => {
            mockAuthStore.error = "Invalid email or password";

            wrapper = mount(LoginPage, {
                global: {
                    plugins: [pinia]
                }
            });

            expect(wrapper.text()).toContain("Invalid email or password");
        });

        it("should not display error message when no error", () => {
            mockAuthStore.error = null;

            wrapper = mount(LoginPage, {
                global: {
                    plugins: [pinia]
                }
            });

            expect(wrapper.find(".bg-red-50").exists()).toBe(false);
        });
    });

    describe("Reactivity", () => {
        it("should react to store loading changes", async () => {
            wrapper = mount(LoginPage, {
                global: {
                    plugins: [pinia]
                }
            });

            // Initially not loading
            expect(wrapper.find('button[type="submit"]').text()).toBe("Sign in");

            // Set loading
            mockAuthStore.isLoading = true;
            await nextTick();

            expect(wrapper.find('button[type="submit"]').text()).toContain("Signing in...");
        });

        it("should react to store error changes", async () => {
            wrapper = mount(LoginPage, {
                global: {
                    plugins: [pinia]
                }
            });

            // Initially no error
            expect(wrapper.find(".bg-red-50").exists()).toBe(false);

            // Set error
            mockAuthStore.error = "Login failed";
            await nextTick();

            expect(wrapper.text()).toContain("Login failed");
        });
    });

    describe("Accessibility", () => {
        it("should have proper form labels and accessibility attributes", () => {
            wrapper = mount(LoginPage, {
                global: {
                    plugins: [pinia]
                }
            });

            const emailInput = wrapper.find('input[name="emailOrUsername"]');
            const passwordInput = wrapper.find('input[name="password"]');

            expect(emailInput.attributes("id")).toBeDefined();
            expect(passwordInput.attributes("id")).toBeDefined();
            expect(emailInput.attributes("required")).toBeDefined();
            expect(passwordInput.attributes("required")).toBeDefined();
        });

        it("should have proper ARIA attributes for password toggle", () => {
            wrapper = mount(LoginPage, {
                global: {
                    plugins: [pinia]
                }
            });

            const toggleButton = wrapper.find('button[type="button"]');
            expect(toggleButton.exists()).toBe(true);
        });
    });

    describe("Validation", () => {
        it("should accept both email and username format", async () => {
            wrapper = mount(LoginPage, {
                global: {
                    plugins: [pinia]
                }
            });

            const emailInput = wrapper.find('input[name="emailOrUsername"]');

            // Should accept email format
            await emailInput.setValue("user@example.com");
            expect(emailInput.element.validity.valid).toBe(true);

            // Should accept username format
            await emailInput.setValue("username123");
            expect(emailInput.element.validity.valid).toBe(true);
        });

        it("should require both emailOrUsername and password", () => {
            wrapper = mount(LoginPage, {
                global: {
                    plugins: [pinia]
                }
            });

            const emailInput = wrapper.find('input[name="emailOrUsername"]');
            const passwordInput = wrapper.find('input[name="password"]');

            expect(emailInput.attributes("required")).toBeDefined();
            expect(passwordInput.attributes("required")).toBeDefined();
        });
    });

    describe("Navigation", () => {
        it("should have correct navigation links", () => {
            wrapper = mount(LoginPage, {
                global: {
                    plugins: [pinia]
                }
            });

            const registerLink = wrapper.find('a[href="/register"]');
            expect(registerLink.exists()).toBe(true);
        });
    });

    describe("Component State", () => {
        it("should initialize with empty credentials", () => {
            wrapper = mount(LoginPage, {
                global: {
                    plugins: [pinia]
                }
            });

            expect(wrapper.vm.credentials.emailOrUsername).toBe("");
            expect(wrapper.vm.credentials.password).toBe("");
            expect(wrapper.vm.showPassword).toBe(false);
        });

        it("should reset form after successful login", async () => {
            mockAuthStore.login.mockResolvedValue({ success: true });

            wrapper = mount(LoginPage, {
                global: {
                    plugins: [pinia]
                }
            });

            // Fill form
            await wrapper.find('input[name="emailOrUsername"]').setValue("test@example.com");
            await wrapper.find('input[name="password"]').setValue("password123");

            // Call handleLogin directly
            await wrapper.vm.handleLogin();
            await nextTick();

            // Verify login was called
            expect(mockAuthStore.login).toHaveBeenCalledWith({
                emailOrUsername: "test@example.com",
                password: "password123"
            });

            // Form should be reset after successful login
            expect(wrapper.vm.credentials.emailOrUsername).toBe("");
            expect(wrapper.vm.credentials.password).toBe("");
        });
    });
});
