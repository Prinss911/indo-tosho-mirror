import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
    plugins: [vue()],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["./tests/setup.ts"]
    },
    resolve: {
        alias: {
            "~": resolve(__dirname, "."),
            "@": resolve(__dirname, "."),
            "#app": resolve(__dirname, "tests/mocks/nuxt-app.ts"),
            "#imports": resolve(__dirname, "tests/mocks/nuxt-imports.ts"),
            "#supabase/server": resolve(__dirname, "tests/mocks/supabase-server.ts"),
            "h3": resolve(__dirname, "tests/mocks/nuxt-imports.ts")
        }
    }
});
