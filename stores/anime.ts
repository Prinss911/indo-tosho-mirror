import { defineStore } from "pinia";
import { v4 as uuidv4 } from "uuid";
import { useSupabase } from "~/services/supabaseClient";
import { debounce } from "lodash-es";

export interface Anime {
    id: string;
    title: string;
    titleEnglish?: string;
    releaseFileName?: string;
    category: string;
    submitter: string;
    submitter_id?: string; // ID of the submitter in the profiles table

    date: string;
    views: number;
    likes: number;
    downloads: number;
    status: "Finished Airing" | "Currently Airing" | "Not yet aired" | "completed" | "ongoing" | "upcoming";
    statusApproval: "pending" | "published" | "rejected";
    rating: number;
    episodes: number;
    genre: string[];
    year: number;
    studio: string;
    coverImage: string;
    description: string;
    postDescription?: string;
    downloadLinks?: any[];
}

export interface Category {
    id: string;
    name: string;
    parent?: string;
    parent_id?: string; // Tambahkan untuk konsistensi dengan database
}

export interface AnimeFilter {
    category: string;
    search: string;
    sortBy: "date" | "title" | "rating" | "downloads";
    sortOrder: "asc" | "desc";
    page: number;
    perPage: number;
}

export const useAnimeStore = defineStore("anime", {
    state: () => {
        return {
            animes: [] as Anime[],
            filteredAnimes: [] as Anime[],
            loading: false,
            error: null as string | null,
            filter: {
                category: "all",
                search: "",
                sortBy: "date",
                sortOrder: "desc",
                page: 1,
                perPage: 20
            } as AnimeFilter,
            totalPages: 0,
            categories: [] as Category[],
            categoryGroups: {},
            dataLoaded: false, // Flag untuk menandai apakah data sudah dimuat
            categoriesLoaded: false, // Flag untuk menandai apakah kategori sudah dimuat
            // Cache untuk optimasi performa
            _filterCache: new Map<string, Anime[]>(),
            _searchCache: new Map<string, Anime[]>()
        };
    },

    getters: {
        paginatedAnimes: state => {
            const start = (state.filter.page - 1) * state.filter.perPage;
            const end = start + state.filter.perPage;
            return state.filteredAnimes.slice(start, end);
        },

        totalAnimes: state => state.filteredAnimes.length,

        hasNextPage: state => state.filter.page < state.totalPages,
        hasPrevPage: state => state.filter.page > 1
    },

    actions: {
        async fetchCategories(forceRefresh = false) {
            // Jika data sudah dimuat dan tidak dipaksa refresh, skip fetch
            if (this.categoriesLoaded && !forceRefresh) {
                return;
            }

            try {
                const { client: supabase } = useSupabase();

                // Fetch categories from Supabase
                const { data, error } = await supabase.from("categories").select("*").order("name");

                if (error) throw error;

                if (!data || data.length === 0) {
                    // Gunakan nama kategori dari database atau default jika tidak ada
                    const allCategoryName = "Semua Kategori";
                    this.categories = [{ id: "all", name: allCategoryName }];
                    console.warn("No categories found in Supabase");
                } else {
                    const categoryList: Category[] = [];

                    // Tambahkan kategori dari Supabase
                    data.forEach(category => {
                        categoryList.push({
                            id: category.id,
                            name: category.name,
                            parent: category.parent_id ?? undefined,
                            parent_id: category.parent_id ?? undefined // Tambahkan untuk konsistensi
                        });
                    });

                    this.categories = categoryList;

                    // Buat categoryGroups untuk kompatibilitas dengan kode lama
                    const groups: Record<string, string[]> = {};

                    // Ambil kategori utama (tanpa parent_id)
                    const mainCategories = data.filter(cat => !cat.parent_id);

                    // Untuk setiap kategori utama, cari subkategorinya
                    mainCategories.forEach(mainCat => {
                        const subcategories = data.filter(cat => cat.parent_id === mainCat.id).map(cat => cat.name);

                        groups[mainCat.name] = subcategories;
                    });

                    this.categoryGroups = groups;
                }

                // Tandai bahwa kategori sudah dimuat
                this.categoriesLoaded = true;
            } catch (error) {
                console.error("Error fetching categories:", error);
                // Fallback to default category
                const allCategoryName = "Semua Kategori";
                this.categories = [{ id: "all", name: allCategoryName }];
                this.categoriesLoaded = true; // Tetap tandai sebagai loaded meskipun error
            }
        },

        async fetchAnimes(forceRefresh = false) {
            // Jika data sudah dimuat dan tidak dipaksa refresh, skip fetch
            if (this.dataLoaded && !forceRefresh) {
                return;
            }

            this.loading = true;
            this.error = null;

            try {
                const { client: supabase } = useSupabase();

                // Fetch data from Supabase
                const { data, error } = await supabase.from("posts").select("*");

                if (error) throw error;

                if (!data || data.length === 0) {
                    this.animes = [];
                    this.error = "Belum ada data anime yang tersedia";
                    console.warn("Belum ada data anime di Supabase");
                } else {
                    // Fetch all unique submitter IDs
                    const submitterIds = [...new Set(data.map(post => post.submitter_id).filter(Boolean))];

                    // Fetch usernames for all submitters in one query
                    let usernameMap = {};
                    if (submitterIds.length > 0) {
                        const { data: profilesData, error: profilesError } = await supabase
                            .from("profiles")
                            .select("id, username")
                            .in("id", submitterIds);

                        if (!profilesError && profilesData) {
                            // Create a map of id -> username
                            usernameMap = profilesData.reduce((map, profile) => {
                                map[profile.id] = profile.username;
                                return map;
                            }, {});
                        }
                    }

                    this.animes = data.map(post => {
                        // Get username from map, submitter_name from post, or use 'Unknown' as fallback
                        const submitterUsername =
                            post.submitter_name ||
                            (post.submitter_id && usernameMap[post.submitter_id]
                                ? usernameMap[post.submitter_id]
                                : "Unknown");

                        return {
                            id: post.id,
                            title: post.title,
                            titleEnglish: post.title_english ?? "",
                            releaseFileName: post.release_file_name ?? "",
                            category: post.category_id,
                            submitter: submitterUsername, // Use submitter_name from database or username from profiles
                            submitter_id: post.submitter_id, // Keep the ID for reference

                            date: post.created_at ?? new Date().toISOString(),
                            created_at: post.created_at,
                            views: post.views ?? 0,
                            likes: post.likes ?? 0,
                            downloads: post.downloads ?? 0,
                            status: post.status || "Finished Airing",
                            statusApproval: post.status_approval || "pending", // Status approval dari database
                            rating: post.rating ?? 0,
                            episodes: post.episodes ?? 0,
                            genre: post.genres ?? [],
                            year: post.year ?? 0,
                            studio: post.studio ?? "",
                            coverImage: post.cover ?? "",
                            description: post.description ?? "",
                            postDescription: post.deskripsi_post ?? "",
                            downloadLinks: post.download_links ?? []
                        };
                    });
                }

                this.applyFilters();

                // Tandai bahwa data sudah dimuat
                this.dataLoaded = true;
            } catch (error) {
                this.error = "Gagal memuat data anime";
                console.error("Error fetching animes:", error);
                this.dataLoaded = true; // Tetap tandai sebagai loaded meskipun error
            } finally {
                this.loading = false;
            }
        },

        applyFilters() {
            // Buat cache key untuk optimasi
            const cacheKey = JSON.stringify({
                category: this.filter.category,
                search: this.filter.search,
                sortBy: this.filter.sortBy,
                sortOrder: this.filter.sortOrder
            });

            // Cek cache terlebih dahulu
            if (this._filterCache.has(cacheKey)) {
                this.filteredAnimes = this._filterCache.get(cacheKey)!;
                this.totalPages = Math.ceil(this.filteredAnimes.length / this.filter.perPage);
                
                // Reset ke halaman pertama jika halaman saat ini melebihi total halaman
                if (this.filter.page > this.totalPages && this.totalPages > 0) {
                    this.filter.page = 1;
                }
                return;
            }

            // Filter hanya anime dengan statusApproval 'published'
            let filtered = [...this.animes].filter(anime => anime.statusApproval === "published");

            // Filter berdasarkan kategori
            if (this.filter.category !== "all") {
                // Cari kategori yang dipilih
                const selectedCategory = this.categories.find(cat => cat.id === this.filter.category);

                if (selectedCategory) {
                    // Jika kategori utama, tampilkan semua anime dari kategori utama dan subkategorinya
                    if (!selectedCategory.parent) {
                        // Dapatkan semua ID subkategori dari kategori utama ini
                        const subcategoryIds = this.categories
                            .filter(cat => cat.parent === selectedCategory.id)
                            .map(cat => cat.id);

                        // Filter anime berdasarkan kategori utama dan subkategorinya
                        filtered = filtered.filter(anime => {
                            // Periksa apakah anime memiliki kategori yang cocok
                            // Catatan: category sekarang berisi category_id dari database
                            return anime.category === selectedCategory.id || subcategoryIds.includes(anime.category);
                        });
                    }
                    // Jika subkategori, tampilkan hanya anime dengan subkategori yang tepat
                    else {
                        filtered = filtered.filter(anime => {
                            // Periksa apakah anime memiliki kategori yang cocok dengan subkategori
                            return anime.category === selectedCategory.id;
                        });
                    }
                }
            }

            // Filter berdasarkan pencarian (Advanced Search) dengan optimasi
            if (this.filter.search) {
                const searchLower = this.filter.search.toLowerCase();
                
                // Cek search cache
                if (this._searchCache.has(searchLower)) {
                    const searchResults = this._searchCache.get(searchLower)!;
                    filtered = filtered.filter(anime => searchResults.some(result => result.id === anime.id));
                } else {
                    const searchResults = filtered.filter(
                        anime =>
                            // Search in title (Japanese/Original)
                            anime.title.toLowerCase().includes(searchLower) ||
                            // Search in title_english
                            (anime.titleEnglish && anime.titleEnglish.toLowerCase().includes(searchLower)) ||
                            // Search in release_file_name
                            (anime.releaseFileName && anime.releaseFileName.toLowerCase().includes(searchLower)) ||
                            // Search in submitter_name
                            anime.submitter.toLowerCase().includes(searchLower) ||
                            // Additional search fields (kept for backward compatibility)
                            anime.studio.toLowerCase().includes(searchLower) ||
                            (anime.description && anime.description.toLowerCase().includes(searchLower))
                    );
                    
                    // Simpan ke search cache (batasi ukuran cache)
                    if (this._searchCache.size > 50) {
                        const firstKey = this._searchCache.keys().next().value;
                        this._searchCache.delete(firstKey);
                    }
                    this._searchCache.set(searchLower, searchResults);
                    filtered = searchResults;
                }
            }

            // Urutkan berdasarkan kriteria yang dipilih dengan optimasi
            const sortComparators = {
                title: (a: Anime, b: Anime) => {
                    const aValue = a.title.toLowerCase();
                    const bValue = b.title.toLowerCase();
                    return this.filter.sortOrder === "asc" ? 
                        (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
                },
                rating: (a: Anime, b: Anime) => {
                    return this.filter.sortOrder === "asc" ? 
                        a.rating - b.rating : b.rating - a.rating;
                },
                downloads: (a: Anime, b: Anime) => {
                    return this.filter.sortOrder === "asc" ? 
                        a.downloads - b.downloads : b.downloads - a.downloads;
                },
                date: (a: Anime, b: Anime) => {
                    const aValue = new Date(a.date ?? a.created_at ?? 0).getTime();
                    const bValue = new Date(b.date ?? b.created_at ?? 0).getTime();
                    return this.filter.sortOrder === "asc" ? 
                        aValue - bValue : bValue - aValue;
                }
            };

            filtered.sort(sortComparators[this.filter.sortBy] || sortComparators.date);

            // Simpan ke cache (batasi ukuran cache)
            if (this._filterCache.size > 100) {
                const firstKey = this._filterCache.keys().next().value;
                this._filterCache.delete(firstKey);
            }
            this._filterCache.set(cacheKey, filtered);

            this.filteredAnimes = filtered;
            this.totalPages = Math.ceil(filtered.length / this.filter.perPage);

            // Reset ke halaman pertama jika halaman saat ini melebihi total halaman
            if (this.filter.page > this.totalPages && this.totalPages > 0) {
                this.filter.page = 1;
            }
        },

        // Fungsi untuk mengkonversi format kategori lama ke format ID baru
        getCategoryIdFromLegacyFormat(legacyCategory: string | undefined): string {
            // Jika undefined atau kosong, kembalikan "all"
            if (!legacyCategory) return "all";

            // Jika nama kategori "all" (dengan berbagai variasi kapitalisasi), kembalikan "all"
            const allCategory = this.categories.find(cat => cat.id === "all");
            const allCategoryName = allCategory?.name?.toLowerCase() ?? "semua kategori";

            if (legacyCategory.toLowerCase() === allCategoryName) return "all";
            // Untuk kompatibilitas dengan kode lama
            if (legacyCategory.toLowerCase() === "all categories") return "all";

            // Cek apakah ini adalah format subkategori lama (dimulai dengan "- ")
            const isSubcategory = legacyCategory.startsWith("- ");

            if (isSubcategory) {
                // Ambil nama subkategori (tanpa "- ")
                const subName = legacyCategory.substring(2).trim();

                // Cari subkategori dengan nama yang cocok
                const subcategory = this.categories.find(
                    cat => cat.parent && cat.name.toLowerCase() === subName.toLowerCase()
                );

                if (subcategory) {
                    return subcategory.id;
                }
            } else {
                // Ini adalah kategori utama, cari kategori dengan nama yang cocok
                const mainCategory = this.categories.find(
                    cat => !cat.parent && cat.name.toLowerCase() === legacyCategory.toLowerCase()
                );

                if (mainCategory) {
                    return mainCategory.id;
                }
            }

            // Jika tidak ditemukan, kembalikan "all"
            return "all";
        },

        // Mengkonversi ID kategori ke format kategori lama
        getLegacyCategoryFromId(categoryId: string): string {
            // Jika "all", kembalikan nama kategori dari database
            if (categoryId === "all") {
                const allCategory = this.categories.find(cat => cat.id === "all");
                return allCategory?.name ?? "Semua Kategori";
            }

            // Cari kategori berdasarkan ID
            const category = this.categories.find(cat => cat.id === categoryId);
            if (!category) {
                const allCategory = this.categories.find(cat => cat.id === "all");
                return allCategory?.name ?? "Semua Kategori";
            }

            return category.name;
        },

        // Debounced search untuk optimasi performa
        debouncedSearch: debounce(function(this: any, searchTerm: string) {
            this.filter.search = searchTerm;
            this.filter.page = 1; // Reset ke halaman pertama
            this.applyFilters();
        }, 300),

        // Clear cache untuk membebaskan memori
        clearCache() {
            this._filterCache.clear();
            this._searchCache.clear();
        },

        updateFilter(newFilter: Partial<AnimeFilter>) {
            // Simpan filter lama sebelum diupdate
            const oldFilter = { ...this.filter };

            // Update filter dengan nilai baru
            this.filter = { ...this.filter, ...newFilter };
            
            // Clear cache jika filter berubah signifikan
            if (oldFilter.category !== this.filter.category || 
                oldFilter.sortBy !== this.filter.sortBy || 
                oldFilter.sortOrder !== this.filter.sortOrder) {
                this.clearCache();
            }

            // Reset ke halaman pertama saat filter berubah
            if ("category" in newFilter || "search" in newFilter || "sortBy" in newFilter || "sortOrder" in newFilter) {
                this.filter.page = 1;
            }

            this.applyFilters();
        },

        updateFilters(newFilters: Partial<AnimeFilter>) {
            // Alias untuk updateFilter untuk kompatibilitas dengan test
            this.updateFilter(newFilters);
        },

        setPage(page: number) {
            this.filter.page = Math.max(1, Math.min(page, this.totalPages));
        },

        async getAnimeById(id: string): Promise<Anime | undefined> {
            try {
                const { client: supabase } = useSupabase();

                // Fetch anime from Supabase posts table
                const { data, error } = await supabase.from("posts").select("*").eq("id", id).maybeSingle(); // Menggunakan maybeSingle() alih-alih single()

                if (error) {
                    console.error("Error fetching anime:", error);
                    return undefined;
                }

                if (!data) {
                    console.log("Anime not found in Supabase, checking local state");
                    // Fallback to local state if not found in Supabase
                    return this.animes.find(anime => String(anime.id) === String(id));
                }

                // Get submitter username with priority: submitter_name from post -> username from profiles -> "Unknown"
                let submitterUsername = "Unknown";
                
                // First priority: use submitter_name from posts table if available
                if (data.submitter_name) {
                    submitterUsername = data.submitter_name;
                } else if (data.submitter_id) {
                    // Second priority: fetch username from profiles table using submitter_id
                    const { data: profileData, error: profileError } = await supabase
                        .from("profiles")
                        .select("username")
                        .eq("id", data.submitter_id)
                        .single();

                    if (!profileError && profileData) {
                        submitterUsername = profileData.username;
                    }
                }
                // If both fail, submitterUsername remains "Unknown"

                return {
                    id: data.id,
                    title: data.title,
                    releaseFileName: data.release_file_name ?? "",
                    category: data.category_id,
                    submitter: submitterUsername, // Use username instead of ID
                    submitter_id: data.submitter_id, // Keep the ID for reference

                    date: data.date ?? new Date().toISOString(),
                    views: data.views ?? 0,
                    likes: data.likes ?? 0,
                    downloads: data.downloads ?? 0,
                    status: data.status || "Finished Airing",
                    statusApproval: data.status_approval ?? "pending",
                    rating: data.rating ?? 0,
                    episodes: data.episodes ?? 0,
                    genre: data.genres ?? [],
                    year: data.year ?? 0,
                    studio: data.studio ?? "",
                    coverImage: data.cover ?? "",
                    description: data.description ?? "",
                    postDescription: data.deskripsi_post ?? "",
                    downloadLinks: data.download_links ?? []
                };
            } catch (error) {
                console.error("Error fetching anime by ID:", error);
                // Fallback to local state
                return this.animes.find(anime => String(anime.id) === String(id));
            }
        },

        async addAnime(anime: Omit<Anime, "id">): Promise<Anime | undefined> {
            try {
                const { client: supabase } = useSupabase();

                const newAnime = {
                    ...anime,
                    id: uuidv4(),
                    date: anime.date ?? new Date().toISOString().split("T")[0]
                };

                // Add anime to Supabase
                const { data, error } = await supabase.from("animes").insert(newAnime).select().single();

                if (error) {
                    console.error("Error adding anime:", error);
                    throw error;
                }

                // Reset cache dan refresh data
                this.dataLoaded = false;
                await this.fetchAnimes();

                return data;
            } catch (error) {
                console.error("Error adding anime:", error);
                return undefined;
            }
        },

        // Method untuk refresh semua data dengan force refresh
        async refreshData() {
            // Clear cache saat refresh data
            this.clearCache();
            this.dataLoaded = false;
            this.categoriesLoaded = false;
            await Promise.all([this.fetchCategories(true), this.fetchAnimes(true)]);
        },

        async updateAnime(id: string, updates: Partial<Anime>): Promise<Anime | undefined> {
            try {
                const { client: supabase } = useSupabase();

                // Update anime in Supabase
                const { data, error } = await supabase.from("animes").update(updates).eq("id", id).select().single();

                if (error) {
                    console.error("Error updating anime:", error);
                    throw error;
                }

                // Reset cache dan refresh data
                this.dataLoaded = false;
                await this.fetchAnimes();

                return data;
            } catch (error) {
                console.error("Error updating anime:", error);
                return undefined;
            }
        },

        async deleteAnime(id: string): Promise<boolean> {
            try {
                const { client: supabase } = useSupabase();

                // Delete anime from Supabase
                const { error } = await supabase.from("posts").delete().eq("id", id);

                if (error) {
                    console.error("Error deleting anime:", error);
                    throw error;
                }

                // Reset cache dan refresh data
                this.dataLoaded = false;
                await this.fetchAnimes();

                return true;
            } catch (error) {
                console.error("Error deleting anime:", error);
                return false;
            }
        }

        // Fungsi generateMockData dan saveMockDataToSupabase telah dihapus
        // karena kita sekarang menggunakan data langsung dari Supabase
    }
});
