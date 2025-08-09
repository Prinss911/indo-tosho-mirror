import { ref, computed, onMounted, onBeforeUnmount, readonly } from "vue";

export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "theme";
const MEDIA_QUERY = "(prefers-color-scheme: dark)";

// Global state
const currentTheme = ref<ThemeMode>("system");
const isDarkMode = ref(false);
const isInitialized = ref(false);

// Media query for system preference
let mediaQuery: MediaQueryList | null = null;

// Cache untuk optimasi
let systemPreferenceCache: { value: boolean; timestamp: number } | null = null;
const CACHE_DURATION = 5000; // 5 detik

/**
 * Composable for managing theme state following Tailwind CSS best practices
 * @returns Theme management utilities
 */
export const useTheme = () => {
    /**
     * Apply dark class to document element
     */
    const applyDarkClass = (dark: boolean) => {
        console.log(`[Theme] Applying dark class: ${dark}`);
        if (typeof document !== "undefined") {
            if (dark) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
            console.log("[Theme] document.documentElement.className:", document.documentElement.className);
        }
    };

    /**
     * Get system preference for dark mode dengan caching
     */
    const getSystemPreference = (): boolean => {
        if (typeof window === "undefined" || !window.matchMedia) {
            return false;
        }
        
        // Gunakan cache jika masih valid
        const now = Date.now();
        if (systemPreferenceCache && (now - systemPreferenceCache.timestamp) < CACHE_DURATION) {
            return systemPreferenceCache.value;
        }
        
        // Update cache
        const preference = window.matchMedia(MEDIA_QUERY).matches;
        systemPreferenceCache = { value: preference, timestamp: now };
        
        return preference;
    };

    /**
     * Update theme based on current mode
     */
    const updateTheme = () => {
        let shouldBeDark = false;

        switch (currentTheme.value) {
            case "dark":
                shouldBeDark = true;
                break;
            case "light":
                shouldBeDark = false;
                break;
            case "system":
                shouldBeDark = getSystemPreference();
                break;
        }

        console.log(
            `[Theme] Updating theme. Current mode: ${currentTheme.value}, System prefers dark: ${getSystemPreference()}, Should be dark: ${shouldBeDark}`
        );
        isDarkMode.value = shouldBeDark;
        applyDarkClass(shouldBeDark);
    };

    /**
     * Set theme mode and persist to localStorage
     */
    const setTheme = (theme: ThemeMode) => {
        console.log(`[Theme] Setting theme to: ${theme}`);
        currentTheme.value = theme;

        if (typeof localStorage !== "undefined") {
            localStorage.setItem(STORAGE_KEY, theme);
        }

        updateTheme();
    };

    /**
     * Toggle between light and dark modes
     */
    const toggleTheme = () => {
        console.log("[Theme] Toggling theme.");
        if (currentTheme.value === "system") {
            // If currently system, toggle to opposite of current system preference
            setTheme(getSystemPreference() ? "light" : "dark");
        } else {
            // Toggle between light and dark
            setTheme(currentTheme.value === "light" ? "dark" : "light");
        }
    };

    /**
     * Initialize theme from localStorage or system preference dengan optimasi
     */
    const initializeTheme = () => {
        if (isInitialized.value) return; // Prevent double initialization
        
        console.log("[Theme] Initializing theme...");
        if (typeof localStorage !== "undefined") {
            const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
            console.log(`[Theme] Found stored theme: ${stored}`);
            if (stored && ["light", "dark", "system"].includes(stored)) {
                currentTheme.value = stored;
            }
        }

        updateTheme();
        isInitialized.value = true;
    };

    /**
     * Handle system preference changes
     */
    const handleSystemChange = (e: MediaQueryListEvent) => {
        if (currentTheme.value === "system") {
            updateTheme();
        }
    };

    /**
     * Setup media query listener
     */
    const setupMediaQuery = () => {
        if (typeof window !== "undefined" && window.matchMedia) {
            mediaQuery = window.matchMedia(MEDIA_QUERY);

            // Modern browsers
            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener("change", handleSystemChange);
            }
            // Legacy browsers
            else if (mediaQuery.addListener) {
                mediaQuery.addListener(handleSystemChange);
            }
        }
    };

    /**
     * Cleanup media query listener dan cache
     */
    const cleanupMediaQuery = () => {
        if (mediaQuery) {
            // Modern browsers
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener("change", handleSystemChange);
            }
            // Legacy browsers
            else if (mediaQuery.removeListener) {
                mediaQuery.removeListener(handleSystemChange);
            }
            mediaQuery = null;
        }
        
        // Clear cache
        systemPreferenceCache = null;
        isInitialized.value = false;
    };

    // Computed properties
    const isLight = computed(() => !isDarkMode.value);
    const isSystemMode = computed(() => currentTheme.value === "system");

    // Lifecycle hooks
    onMounted(() => {
        initializeTheme();
        setupMediaQuery();
    });

    onBeforeUnmount(() => {
        cleanupMediaQuery();
    });

    return {
        // State
        currentTheme: readonly(currentTheme),
        isDarkMode: readonly(isDarkMode),
        isLight,
        isSystemMode,

        // Actions
        setTheme,
        toggleTheme,
        initializeTheme,

        // Utilities
        getSystemPreference
    };
};

/**
 * Script to prevent FOUC (Flash of Unstyled Content)
 * This should be added to the document head before any CSS
 */
export const themeScript = `
(function() {
  const theme = localStorage.getItem('${STORAGE_KEY}') ?? 'system';
  const isDark = theme === 'dark' || 
    (theme === 'system' && window.matchMedia('${MEDIA_QUERY}').matches);
  
  if (isDark) {
    document.documentElement.classList.add('dark');
  }
})();
`;
