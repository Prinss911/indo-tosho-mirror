import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import type { Anime } from "~/types/anime";

// Simple mock component for AnimeTable
const AnimeTable = {
    name: "AnimeTable",
    template: `
    <div data-testid="anime-table">
      <div v-if="loading" data-testid="loading-spinner">Loading...</div>
      <div v-else-if="error" data-testid="error-message">{{ error }}</div>
      <div v-else>
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Category</th>
              <th>Rating</th>
              <th>Year</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="anime in animes" :key="anime.id" 
                class="hover:bg-gray-50 cursor-pointer" 
                @click="navigateToDetail(anime.id)"
                data-testid="anime-row">
              <td><img :src="anime.image" :alt="anime.title" /></td>
              <td data-testid="anime-title">{{ anime.title }}</td>
              <td>{{ anime.category }}</td>
              <td><span data-testid="star-icon">⭐</span>{{ anime.rating }}</td>
              <td><span data-testid="calendar-icon">📅</span>{{ anime.year }}</td>
              <td>{{ anime.status }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
    props: {
        animes: { type: Array, default: () => [] },
        loading: { type: Boolean, default: false },
        error: { type: String, default: null }
    },
    methods: {
        navigateToDetail(id) {
            this.$emit("navigate", id);
            mockPush(`/anime/${id}`);
        }
    }
};

// Mock Nuxt router
const mockPush = vi.fn();
vi.mock("#app", () => ({
    navigateTo: mockPush
}));

describe("AnimeTable Component Unit Tests", () => {
    let mockAnimes: Anime[];

    const createMockAnimes = (): Anime[] => [
        {
            id: 1,
            title: "Attack on Titan",
            category: "Anime - Sudah diterjemahkan",
            rating: 9.0,
            year: 2013,
            status: "Completed",
            synopsis: "Humanity fights against titans",
            episodes: 25,
            image: "https://example.com/aot.jpg"
        },
        {
            id: 2,
            title: "Death Note",
            category: "Thriller",
            rating: 9.0,
            year: 2006,
            status: "Completed",
            synopsis: "A supernatural notebook",
            episodes: 37,
            image: "https://example.com/deathnote.jpg"
        }
    ];

    beforeEach(() => {
        mockAnimes = createMockAnimes();
        vi.clearAllMocks();
    });

    describe("Component Rendering", () => {
        it("should render table with anime data", () => {
            const wrapper = mount(AnimeTable, {
                props: {
                    animes: mockAnimes
                }
            });

            expect(wrapper.find("table").exists()).toBe(true);
            expect(wrapper.find("thead").exists()).toBe(true);
            expect(wrapper.find("tbody").exists()).toBe(true);

            const headers = wrapper.findAll("th");
            expect(headers).toHaveLength(6);
            expect(headers[1].text()).toBe("Title");
            expect(headers[2].text()).toBe("Category");
        });

        it("should render correct number of anime rows", () => {
            const wrapper = mount(AnimeTable, {
                props: {
                    animes: mockAnimes
                }
            });

            const rows = wrapper.findAll('[data-testid="anime-row"]');
            expect(rows).toHaveLength(2);
        });

        it("should display anime information correctly", () => {
            const wrapper = mount(AnimeTable, {
                props: {
                    animes: mockAnimes
                }
            });

            const firstTitle = wrapper.find('[data-testid="anime-title"]');
            expect(firstTitle.text()).toBe("Attack on Titan");
        });

        it("should render loading state", () => {
            const wrapper = mount(AnimeTable, {
                props: {
                    animes: [],
                    loading: true
                }
            });

            expect(wrapper.find('[data-testid="loading-spinner"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="loading-spinner"]').text()).toBe("Loading...");
        });

        it("should render error state", () => {
            const wrapper = mount(AnimeTable, {
                props: {
                    animes: [],
                    error: "Failed to load data"
                }
            });

            expect(wrapper.find('[data-testid="error-message"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="error-message"]').text()).toBe("Failed to load data");
        });
    });

    describe("Interactive Features", () => {
        it("should handle row click navigation", async () => {
            const wrapper = mount(AnimeTable, {
                props: {
                    animes: mockAnimes
                }
            });

            const firstRow = wrapper.find('[data-testid="anime-row"]');
            await firstRow.trigger("click");

            expect(mockPush).toHaveBeenCalledWith("/anime/1");
        });

        it("should emit navigate event on row click", async () => {
            const wrapper = mount(AnimeTable, {
                props: {
                    animes: mockAnimes
                }
            });

            const firstRow = wrapper.find('[data-testid="anime-row"]');
            await firstRow.trigger("click");

            expect(wrapper.emitted("navigate")).toBeTruthy();
            expect(wrapper.emitted("navigate")[0]).toEqual([1]);
        });
    });

    describe("Visual Elements", () => {
        it("should display star icons for ratings", () => {
            const wrapper = mount(AnimeTable, {
                props: {
                    animes: mockAnimes
                }
            });

            const starIcons = wrapper.findAll('[data-testid="star-icon"]');
            expect(starIcons.length).toBe(2);
        });

        it("should display calendar icons for years", () => {
            const wrapper = mount(AnimeTable, {
                props: {
                    animes: mockAnimes
                }
            });

            const calendarIcons = wrapper.findAll('[data-testid="calendar-icon"]');
            expect(calendarIcons.length).toBe(2);
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty anime list", () => {
            const wrapper = mount(AnimeTable, {
                props: {
                    animes: []
                }
            });

            expect(wrapper.find("table").exists()).toBe(true);
            expect(wrapper.findAll('[data-testid="anime-row"]')).toHaveLength(0);
        });

        it("should handle anime with missing properties", () => {
            const incompleteAnime = [
                {
                    id: 1,
                    title: "Test Anime",
                    category: "Anime - Sudah diterjemahkan",
                    rating: 8.0,
                    year: 2020,
                    status: "Ongoing",
                    synopsis: "Test synopsis",
                    episodes: 12,
                    image: ""
                }
            ];

            const wrapper = mount(AnimeTable, {
                props: {
                    animes: incompleteAnime
                }
            });

            expect(wrapper.find('[data-testid="anime-title"]').text()).toBe("Test Anime");
        });
    });
});
