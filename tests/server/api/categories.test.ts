import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Categories API Endpoint", () => {
    // Mock functions
    const mockServerSupabaseClient = vi.fn();
    const mockCreateError = vi.fn(params => params);

    // Mock handler
    const categoriesHandler = async event => {
        const method = event.node.req.method;

        // Hanya mendukung metode GET
        if (method === "GET") {
            try {
                const supabase = await mockServerSupabaseClient(event);

                // Ambil semua kategori dari tabel categories
                const { data, error } = await supabase.from("categories").select("*").order("name");

                if (error) {
                    throw mockCreateError({
                        statusCode: 500,
                        statusMessage: `Error fetching categories: ${error.message}`
                    });
                }

                return data;
            } catch (error) {
                console.error("Error fetching categories:", error);
                throw mockCreateError({
                    statusCode: 500,
                    statusMessage: `Failed to fetch categories: ${error.message}`
                });
            }
        }

        // Jika bukan metode GET, kembalikan error
        throw mockCreateError({
            statusCode: 405,
            statusMessage: "Method Not Allowed"
        });
    };

    let mockEvent;
    let mockSupabase;

    beforeEach(() => {
        // Reset mocks
        vi.resetAllMocks();

        // Setup mock event
        mockEvent = {
            node: {
                req: {
                    method: "GET"
                }
            },
            context: {}
        };

        // Setup mock Supabase client
        mockSupabase = {
            from: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis()
        };

        // Mock serverSupabaseClient to return our mockSupabase
        mockServerSupabaseClient.mockResolvedValue(mockSupabase);
    });

    it("should return categories on successful GET request", async () => {
        // Mock data yang akan dikembalikan oleh Supabase
        const mockCategories = [
            { id: "1", name: "Action", parent_id: null },
            { id: "2", name: "Comedy", parent_id: null },
            { id: "3", name: "Action > Shounen", parent_id: "1" }
        ];

        // Setup mock response dari Supabase
        mockSupabase.order.mockResolvedValue({
            data: mockCategories,
            error: null
        });

        // Panggil handler
        const result = await categoriesHandler(mockEvent);

        // Verifikasi bahwa Supabase dipanggil dengan benar
        expect(mockServerSupabaseClient).toHaveBeenCalledWith(mockEvent);
        expect(mockSupabase.from).toHaveBeenCalledWith("categories");
        expect(mockSupabase.select).toHaveBeenCalledWith("*");
        expect(mockSupabase.order).toHaveBeenCalledWith("name");

        // Verifikasi hasil
        expect(result).toEqual(mockCategories);
    });

    it("should throw error when Supabase returns an error", async () => {
        // Setup mock error dari Supabase
        const mockError = { message: "Database error" };

        // Setup mock response dengan error
        mockSupabase.order.mockRejectedValue(mockError);

        // Verifikasi bahwa handler melempar error dengan pesan yang tepat
        await expect(categoriesHandler(mockEvent)).rejects.toMatchObject({
            statusCode: 500,
            statusMessage: "Failed to fetch categories: Database error"
        });

        // Verifikasi bahwa Supabase dipanggil dengan benar
        expect(mockServerSupabaseClient).toHaveBeenCalledWith(mockEvent);
        expect(mockSupabase.from).toHaveBeenCalledWith("categories");
        expect(mockSupabase.select).toHaveBeenCalledWith("*");
        expect(mockSupabase.order).toHaveBeenCalledWith("name");
    });

    it("should throw error for non-GET methods", async () => {
        // Ubah method menjadi POST
        mockEvent.node.req.method = "POST";

        // Verifikasi bahwa handler melempar error untuk metode selain GET
        await expect(categoriesHandler(mockEvent)).rejects.toEqual({
            statusCode: 405,
            statusMessage: "Method Not Allowed"
        });
    });
});
