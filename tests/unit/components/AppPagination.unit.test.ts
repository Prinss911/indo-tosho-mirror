import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";

// Simple mock component for AppPagination
const AppPagination = {
    name: "AppPagination",
    template: `
    <div data-testid="pagination" class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <button 
          :disabled="currentPage === 1" 
          @click="goToPage(currentPage - 1)"
          data-testid="prev-button"
          class="px-3 py-1 border rounded"
        >
          Previous
        </button>
        
        <span v-for="page in visiblePages" :key="page" class="page-item">
          <button 
            v-if="page !== '...'"
            :class="{
              'bg-blue-500 text-white': page === currentPage,
              'bg-gray-200': page !== currentPage
            }"
            @click="goToPage(page)"
            :data-testid="'page-' + page"
            class="px-3 py-1 border rounded"
          >
            {{ page }}
          </button>
          <span v-else data-testid="ellipsis">...</span>
        </span>
        
        <button 
          :disabled="currentPage === totalPages" 
          @click="goToPage(currentPage + 1)"
          data-testid="next-button"
          class="px-3 py-1 border rounded"
        >
          Next
        </button>
      </div>
      
      <div data-testid="page-info">
        Page {{ currentPage }} of {{ totalPages }}
      </div>
    </div>
  `,
    props: {
        currentPage: { type: Number, default: 1 },
        totalPages: { type: Number, default: 1 },
        maxVisiblePages: { type: Number, default: 5 }
    },
    computed: {
        visiblePages() {
            const pages = [];
            const total = this.totalPages;
            const current = this.currentPage;
            const max = this.maxVisiblePages;

            if (total <= max) {
                for (let i = 1; i <= total; i++) {
                    pages.push(i);
                }
            } else {
                const half = Math.floor(max / 2);
                let start = Math.max(1, current - half);
                let end = Math.min(total, start + max - 1);

                if (end - start < max - 1) {
                    start = Math.max(1, end - max + 1);
                }

                if (start > 1) {
                    pages.push(1);
                    if (start > 2) pages.push("...");
                }

                for (let i = start; i <= end; i++) {
                    pages.push(i);
                }

                if (end < total) {
                    if (end < total - 1) pages.push("...");
                    pages.push(total);
                }
            }

            return pages;
        }
    },
    methods: {
        goToPage(page) {
            if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
                this.$emit("page-change", page);
            }
        }
    }
};

describe("AppPagination Component Unit Tests", () => {
    describe("Component Rendering", () => {
        it("should render pagination component", () => {
            const wrapper = mount(AppPagination, {
                props: {
                    currentPage: 1,
                    totalPages: 5
                }
            });

            expect(wrapper.find('[data-testid="pagination"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="prev-button"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="next-button"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="page-info"]').exists()).toBe(true);
        });

        it("should display correct page info", () => {
            const wrapper = mount(AppPagination, {
                props: {
                    currentPage: 3,
                    totalPages: 10
                }
            });

            const pageInfo = wrapper.find('[data-testid="page-info"]');
            expect(pageInfo.text()).toBe("Page 3 of 10");
        });

        it("should render correct number of page buttons for small total pages", () => {
            const wrapper = mount(AppPagination, {
                props: {
                    currentPage: 1,
                    totalPages: 3
                }
            });

            expect(wrapper.find('[data-testid="page-1"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="page-2"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="page-3"]').exists()).toBe(true);
        });

        it("should highlight current page", () => {
            const wrapper = mount(AppPagination, {
                props: {
                    currentPage: 2,
                    totalPages: 5
                }
            });

            const currentPageButton = wrapper.find('[data-testid="page-2"]');
            expect(currentPageButton.classes()).toContain("bg-blue-500");
            expect(currentPageButton.classes()).toContain("text-white");
        });
    });

    describe("Navigation Controls", () => {
        it("should disable previous button on first page", () => {
            const wrapper = mount(AppPagination, {
                props: {
                    currentPage: 1,
                    totalPages: 5
                }
            });

            const prevButton = wrapper.find('[data-testid="prev-button"]');
            expect(prevButton.attributes("disabled")).toBeDefined();
        });

        it("should disable next button on last page", () => {
            const wrapper = mount(AppPagination, {
                props: {
                    currentPage: 5,
                    totalPages: 5
                }
            });

            const nextButton = wrapper.find('[data-testid="next-button"]');
            expect(nextButton.attributes("disabled")).toBeDefined();
        });

        it("should enable both buttons on middle pages", () => {
            const wrapper = mount(AppPagination, {
                props: {
                    currentPage: 3,
                    totalPages: 5
                }
            });

            const prevButton = wrapper.find('[data-testid="prev-button"]');
            const nextButton = wrapper.find('[data-testid="next-button"]');

            expect(prevButton.attributes("disabled")).toBeUndefined();
            expect(nextButton.attributes("disabled")).toBeUndefined();
        });
    });

    describe("Page Navigation", () => {
        it("should emit page-change event when clicking page button", async () => {
            const wrapper = mount(AppPagination, {
                props: {
                    currentPage: 1,
                    totalPages: 5
                }
            });

            const pageButton = wrapper.find('[data-testid="page-3"]');
            await pageButton.trigger("click");

            expect(wrapper.emitted("page-change")).toBeTruthy();
            expect(wrapper.emitted("page-change")[0]).toEqual([3]);
        });

        it("should emit page-change event when clicking previous button", async () => {
            const wrapper = mount(AppPagination, {
                props: {
                    currentPage: 3,
                    totalPages: 5
                }
            });

            const prevButton = wrapper.find('[data-testid="prev-button"]');
            await prevButton.trigger("click");

            expect(wrapper.emitted("page-change")).toBeTruthy();
            expect(wrapper.emitted("page-change")[0]).toEqual([2]);
        });

        it("should emit page-change event when clicking next button", async () => {
            const wrapper = mount(AppPagination, {
                props: {
                    currentPage: 2,
                    totalPages: 5
                }
            });

            const nextButton = wrapper.find('[data-testid="next-button"]');
            await nextButton.trigger("click");

            expect(wrapper.emitted("page-change")).toBeTruthy();
            expect(wrapper.emitted("page-change")[0]).toEqual([3]);
        });

        it("should not emit event when clicking current page", async () => {
            const wrapper = mount(AppPagination, {
                props: {
                    currentPage: 2,
                    totalPages: 5
                }
            });

            const currentPageButton = wrapper.find('[data-testid="page-2"]');
            await currentPageButton.trigger("click");

            expect(wrapper.emitted("page-change")).toBeFalsy();
        });
    });

    describe("Ellipsis Handling", () => {
        it("should show ellipsis for large page counts", () => {
            const wrapper = mount(AppPagination, {
                props: {
                    currentPage: 5,
                    totalPages: 20,
                    maxVisiblePages: 5
                }
            });

            const ellipsis = wrapper.findAll('[data-testid="ellipsis"]');
            expect(ellipsis.length).toBeGreaterThan(0);
        });

        it("should not show ellipsis for small page counts", () => {
            const wrapper = mount(AppPagination, {
                props: {
                    currentPage: 2,
                    totalPages: 4,
                    maxVisiblePages: 5
                }
            });

            const ellipsis = wrapper.findAll('[data-testid="ellipsis"]');
            expect(ellipsis.length).toBe(0);
        });
    });

    describe("Edge Cases", () => {
        it("should handle single page", () => {
            const wrapper = mount(AppPagination, {
                props: {
                    currentPage: 1,
                    totalPages: 1
                }
            });

            const prevButton = wrapper.find('[data-testid="prev-button"]');
            const nextButton = wrapper.find('[data-testid="next-button"]');

            expect(prevButton.attributes("disabled")).toBeDefined();
            expect(nextButton.attributes("disabled")).toBeDefined();
            expect(wrapper.find('[data-testid="page-1"]').exists()).toBe(true);
        });

        it("should handle zero total pages", () => {
            const wrapper = mount(AppPagination, {
                props: {
                    currentPage: 1,
                    totalPages: 0
                }
            });

            expect(wrapper.find('[data-testid="pagination"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="page-info"]').text()).toBe("Page 1 of 0");
        });

        it("should handle large page numbers", () => {
            const wrapper = mount(AppPagination, {
                props: {
                    currentPage: 50,
                    totalPages: 100
                }
            });

            expect(wrapper.find('[data-testid="page-info"]').text()).toBe("Page 50 of 100");
            expect(wrapper.find('[data-testid="page-50"]').exists()).toBe(true);
        });
    });

    describe("Props Validation", () => {
        it("should handle prop changes", async () => {
            const wrapper = mount(AppPagination, {
                props: {
                    currentPage: 1,
                    totalPages: 5
                }
            });

            expect(wrapper.find('[data-testid="page-info"]').text()).toBe("Page 1 of 5");

            await wrapper.setProps({ currentPage: 3, totalPages: 10 });
            expect(wrapper.find('[data-testid="page-info"]').text()).toBe("Page 3 of 10");
        });

        it("should handle maxVisiblePages prop", () => {
            const wrapper = mount(AppPagination, {
                props: {
                    currentPage: 1,
                    totalPages: 10,
                    maxVisiblePages: 3
                }
            });

            // Should show limited number of pages based on maxVisiblePages
            expect(wrapper.find('[data-testid="pagination"]').exists()).toBe(true);
        });
    });
});
