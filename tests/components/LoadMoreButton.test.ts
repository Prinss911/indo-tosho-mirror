import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import LoadMoreButton from "~/components/LoadMoreButton.vue";

describe("LoadMoreButton", () => {
    let wrapper: any;

    beforeEach(() => {
        wrapper = mount(LoadMoreButton, {
            props: {
                isLoading: false,
                hasNextPage: true
            }
        });
    });

    it("should render the button with default text", () => {
        expect(wrapper.find("button").exists()).toBe(true);
        expect(wrapper.find("button").text()).toBe("Muat Lebih Banyak");
    });

    it("should render custom text when provided", async () => {
        await wrapper.setProps({ buttonText: "Load More" });
        expect(wrapper.find("button").text()).toBe("Load More");
    });

    it("should render loading text when isLoading is true", async () => {
        await wrapper.setProps({ isLoading: true });
        expect(wrapper.find("button").text()).toBe("Memuat...");
    });

    it("should be disabled when isLoading is true", async () => {
        await wrapper.setProps({ isLoading: true });
        expect(wrapper.find("button").attributes("disabled")).toBeDefined();
    });

    it("should be disabled when hasNextPage is false", async () => {
        await wrapper.setProps({ hasNextPage: false });
        expect(wrapper.find("button").attributes("disabled")).toBeDefined();
    });

    it("should not be disabled when isLoading is false and hasNextPage is true", () => {
        expect(wrapper.find("button").attributes("disabled")).toBeUndefined();
    });

    it("should emit click event when button is clicked", async () => {
        await wrapper.find("button").trigger("click");
        expect(wrapper.emitted().click).toBeTruthy();
        expect(wrapper.emitted().click.length).toBe(1);
    });

    it("should not emit click event when button is disabled", async () => {
        await wrapper.setProps({ isLoading: true });
        await wrapper.find("button").trigger("click");
        expect(wrapper.emitted().click).toBeUndefined();
    });

    it("should show different text when no more items", async () => {
        await wrapper.setProps({ hasNextPage: false, noMoreText: "Tidak ada lagi" });
        expect(wrapper.find("button").text()).toBe("Tidak ada lagi");
    });
});
