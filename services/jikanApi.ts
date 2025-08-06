// Jikan API Service untuk mengambil data anime dari MyAnimeList

export interface JikanAnime {
    mal_id: number;
    title: string;
    title_english?: string;
    title_japanese?: string;
    type: string;
    episodes?: number;
    status: string;
    aired: {
        from: string;
        to?: string;
        prop: {
            from: {
                day: number;
                month: number;
                year: number;
            };
            to?: {
                day: number;
                month: number;
                year: number;
            };
        };
    };
    duration: string;
    rating: string;
    score?: number;
    scored_by?: number;
    rank?: number;
    popularity?: number;
    members?: number;
    favorites?: number;
    synopsis?: string;
    background?: string;
    season?: string;
    year?: number;
    broadcast?: {
        day: string;
        time: string;
        timezone: string;
        string: string;
    };
    producers: Array<{
        mal_id: number;
        type: string;
        name: string;
        url: string;
    }>;
    licensors: Array<{
        mal_id: number;
        type: string;
        name: string;
        url: string;
    }>;
    studios: Array<{
        mal_id: number;
        type: string;
        name: string;
        url: string;
    }>;
    genres: Array<{
        mal_id: number;
        type: string;
        name: string;
        url: string;
    }>;
    themes: Array<{
        mal_id: number;
        type: string;
        name: string;
        url: string;
    }>;
    demographics: Array<{
        mal_id: number;
        type: string;
        name: string;
        url: string;
    }>;
    images: {
        jpg: {
            image_url: string;
            small_image_url: string;
            large_image_url: string;
        };
        webp: {
            image_url: string;
            small_image_url: string;
            large_image_url: string;
        };
    };
    trailer?: {
        youtube_id?: string;
        url?: string;
        embed_url?: string;
    };
    approved: boolean;
    titles: Array<{
        type: string;
        title: string;
    }>;
}

export interface JikanSearchResponse {
    data: JikanAnime[];
    pagination: {
        last_visible_page: number;
        has_next_page: boolean;
        current_page: number;
        items: {
            count: number;
            total: number;
            per_page: number;
        };
    };
}

export interface JikanAnimeResponse {
    data: JikanAnime;
}

class JikanApiService {
    private baseUrl = "https://api.jikan.moe/v4";
    private requestDelay = 1000; // 1 detik delay untuk menghindari rate limiting
    private lastRequestTime = 0;

    private async makeRequest<T>(endpoint: string): Promise<T> {
        // Rate limiting - tunggu minimal 1 detik antara request
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.requestDelay) {
            await new Promise(resolve => setTimeout(resolve, this.requestDelay - timeSinceLastRequest));
        }
        this.lastRequestTime = Date.now();

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Jikan API Error:", error);
            throw error;
        }
    }

    /**
     * Mencari anime berdasarkan query
     */
    async searchAnime(query: string, page = 1, limit = 25): Promise<JikanSearchResponse> {
        const params = new URLSearchParams({
            q: query,
            page: page.toString(),
            limit: limit.toString(),
            order_by: "score",
            sort: "desc"
        });

        return this.makeRequest<JikanSearchResponse>(`/anime?${params}`);
    }

    /**
     * Mendapatkan detail anime berdasarkan MAL ID
     */
    async getAnimeById(malId: number): Promise<JikanAnimeResponse> {
        return this.makeRequest<JikanAnimeResponse>(`/anime/${malId}`);
    }

    /**
     * Mendapatkan anime berdasarkan genre
     */
    async getAnimeByGenre(genreId: number, page = 1): Promise<JikanSearchResponse> {
        const params = new URLSearchParams({
            genres: genreId.toString(),
            page: page.toString(),
            order_by: "score",
            sort: "desc"
        });

        return this.makeRequest<JikanSearchResponse>(`/anime?${params}`);
    }

    /**
     * Mendapatkan anime top/populer
     */
    async getTopAnime(
        type: "airing" | "upcoming" | "bypopularity" | "favorite" = "bypopularity",
        page = 1
    ): Promise<JikanSearchResponse> {
        const params = new URLSearchParams({
            type,
            page: page.toString()
        });

        return this.makeRequest<JikanSearchResponse>(`/top/anime?${params}`);
    }

    /**
     * Mendapatkan anime berdasarkan season
     */
    async getAnimeBySeason(
        year: number,
        season: "winter" | "spring" | "summer" | "fall",
        page = 1
    ): Promise<JikanSearchResponse> {
        const params = new URLSearchParams({
            page: page.toString()
        });

        return this.makeRequest<JikanSearchResponse>(`/seasons/${year}/${season}?${params}`);
    }

    /**
     * Mendapatkan anime yang sedang tayang
     */
    async getCurrentSeasonAnime(page = 1): Promise<JikanSearchResponse> {
        const params = new URLSearchParams({
            page: page.toString()
        });

        return this.makeRequest<JikanSearchResponse>(`/seasons/now?${params}`);
    }

    /**
     * Konversi data Jikan ke format aplikasi
     */
    convertToAppFormat(jikanAnime: JikanAnime) {
        return {
            malId: jikanAnime.mal_id,
            title: jikanAnime.title,
            titleEnglish: jikanAnime.title_english,
            titleJapanese: jikanAnime.title_japanese,
            type: jikanAnime.type,
            episodes: jikanAnime.episodes ?? 0,
            status: jikanAnime.status,
            year: jikanAnime.year ?? new Date(jikanAnime.aired.from).getFullYear(),
            season: jikanAnime.season,
            rating: jikanAnime.score ?? 0,
            scoredBy: jikanAnime.scored_by ?? 0,
            rank: jikanAnime.rank,
            popularity: jikanAnime.popularity,
            members: jikanAnime.members ?? 0,
            favorites: jikanAnime.favorites ?? 0,
            synopsis: jikanAnime.synopsis,
            background: jikanAnime.background,
            duration: jikanAnime.duration,
            ageRating: jikanAnime.rating,
            cover: jikanAnime.images.jpg.large_image_url,
            coverSmall: jikanAnime.images.jpg.small_image_url,
            trailer: jikanAnime.trailer?.youtube_id
                ? `https://www.youtube.com/watch?v=${jikanAnime.trailer.youtube_id}`
                : null,
            genres: jikanAnime.genres.map(g => g.name),
            themes: jikanAnime.themes.map(t => t.name),
            demographics: jikanAnime.demographics.map(d => d.name),
            studios: jikanAnime.studios.map(s => s.name),
            producers: jikanAnime.producers.map(p => p.name),
            licensors: jikanAnime.licensors.map(l => l.name),
            airedFrom: jikanAnime.aired.from,
            airedTo: jikanAnime.aired.to,
            broadcast: jikanAnime.broadcast?.string
        };
    }
}

export const jikanApi = new JikanApiService();
export default jikanApi;
