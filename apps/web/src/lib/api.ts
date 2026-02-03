const IS_PROD = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
const PRODUCTION_URL = 'https://campus-os-api.onrender.com/api/v1';

// Ensure the URL is absolute and starts with http/https
function getBaseUrl() {
    let url = process.env.NEXT_PUBLIC_API_URL;

    // If empty or "campus-os-api" (common Render misconfiguration), use hardcoded fallback
    if (!url || url === 'campus-os-api' || !url.startsWith('http')) {
        if (IS_PROD) return PRODUCTION_URL;
        return 'http://localhost:3000/api/v1';
    }

    return url;
}

const API_BASE_URL = getBaseUrl();
console.log('📡 Resolved API Base URL:', API_BASE_URL);

export class CampusOSAPI {
    private getHeaders(includeAuth = true): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (includeAuth) {
            const token = this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    private getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('campus_os_token');
        }
        return null;
    }

    private setToken(token: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem('campus_os_token', token);
        }
    }

    private removeToken(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('campus_os_token');
        }
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
        includeAuth = true
    ): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = this.getHeaders(includeAuth);

        try {
            console.log('API Request:', url, options.method || 'GET');

            const response = await fetch(url, {
                ...options,
                headers: {
                    ...headers,
                    ...options.headers,
                },
            });

            console.log('API Response Status:', response.status);
            const contentType = response.headers.get('content-type');
            console.log('Content-Type:', contentType);

            // Check if response is JSON
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`API returned non-JSON response (${response.status}) at ${url}. Preview: ${text.substring(0, 100)}...`);
            }

            const data = await response.json();
            console.log('Parsed JSON:', data);

            if (!response.ok) {
                throw new Error(data.error?.message || `Request failed with status ${response.status}`);
            }

            return data.data as T;
        } catch (error: any) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // ============================================
    // AUTH
    // ============================================

    async login(email: string, password: string): Promise<{ token: string; user: any }> {
        const data = await this.request<{ token: string; user: any }>(
            '/auth/login',
            {
                method: 'POST',
                body: JSON.stringify({ email_or_phone: email, password }),
            },
            false
        );
        this.setToken(data.token);
        return data;
    }

    async register(userData: {
        full_name: string;
        email?: string;
        phone?: string;
        password: string;
        campus_id: string;
    }): Promise<{ token: string; user: any }> {
        const data = await this.request<{ token: string; user: any }>(
            '/auth/register',
            {
                method: 'POST',
                body: JSON.stringify(userData),
            },
            false
        );
        this.setToken(data.token);
        return data;
    }

    async getProfile(): Promise<any> {
        return this.request('/me');
    }

    async updateProfile(updates: { username?: string; campus_id?: string }): Promise<any> {
        return this.request('/me', {
            method: 'PATCH',
            body: JSON.stringify(updates),
        });
    }

    logout(): void {
        this.removeToken();
    }

    // ============================================
    // CORE
    // ============================================

    async getCampuses(): Promise<any[]> {
        return this.request('/campuses', {}, false);
    }

    async getCourses(params?: { campus_id?: string; q?: string }): Promise<any> {
        const query = new URLSearchParams(params as any).toString();
        return this.request(`/courses?${query}`, {}, false);
    }

    // ============================================
    // FEED
    // ============================================

    async getFeed(params?: {
        campus_id?: string;
        page?: number;
        pageSize?: number;
    }): Promise<{ data: any[]; meta: any }> {
        const query = new URLSearchParams(params as any).toString();
        return this.request(`/feed?${query}`, {}, false);
    }

    async getPost(postId: string): Promise<any> {
        return this.request(`/feed/${postId}`, {}, false);
    }

    async createPost(data: {
        post_type: string;
        title?: string;
        body: string;
        is_anonymous?: boolean;
    }): Promise<any> {
        return this.request('/feed', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async toggleReaction(postId: string): Promise<any> {
        return this.request(`/feed/${postId}/reactions`, {
            method: 'POST',
        });
    }

    async getComments(postId: string, page = 1): Promise<any> {
        return this.request(`/feed/${postId}/comments?page=${page}`, {}, false);
    }

    async createComment(postId: string, body: string, isAnonymous = false): Promise<any> {
        return this.request(`/feed/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ body, is_anonymous: isAnonymous }),
        });
    }

    // ============================================
    // MARKETPLACE (Campus Trade)
    // ============================================

    async getMarketplace(params?: {
        campus_id?: string;
        category?: string;
        subcategory?: string;
        listing_type?: string;
        min_price?: number;
        max_price?: number;
        condition?: string;
        search?: string;
        sort?: string;
        page?: number;
    }): Promise<{ data: any[]; meta: any }> {
        const query = new URLSearchParams(params as any).toString();
        return this.request(`/marketplace?${query}`, {}, false);
    }

    async getListing(listingId: string, campusId: string): Promise<any> {
        return this.request(`/marketplace/${listingId}?campus_id=${campusId}`, {}, false);
    }

    async createListing(data: {
        title: string;
        description: string;
        category: string;
        subcategory?: string;
        listingType: string;
        priceUgx?: number;
        isNegotiable?: boolean;
        condition?: string;
        images?: string[];
        meetsLocation?: string;
    }): Promise<any> {
        return this.request('/marketplace', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateListing(listingId: string, data: any): Promise<any> {
        return this.request(`/marketplace/${listingId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async deleteListing(listingId: string): Promise<any> {
        return this.request(`/marketplace/${listingId}`, {
            method: 'DELETE',
        });
    }

    async markListingAsSold(listingId: string): Promise<any> {
        return this.request(`/marketplace/${listingId}/mark-sold`, {
            method: 'POST',
        });
    }

    // ============================================
    // ARTICLES
    // ============================================

    async getArticles(params?: {
        campus_id?: string;
        tier?: string;
        q?: string;
        sort?: string;
        page?: number;
    }): Promise<{ data: any[]; meta: any }> {
        const query = new URLSearchParams(params as any).toString();
        return this.request(`/articles?${query}`, {}, false);
    }

    async getArticle(articleId: string): Promise<any> {
        return this.request(`/articles/${articleId}`);
    }

    async markArticleComplete(articleId: string): Promise<any> {
        return this.request(`/articles/${articleId}/complete`, {
            method: 'POST',
        });
    }

    // ============================================
    // TIMETABLE
    // ============================================

    async getTimetable(): Promise<any[]> {
        return this.request('/timetable');
    }

    async addTimetableEntry(data: {
        campus_id: string;
        course_id: string;
        day_of_week: string;
        start_time: string;
        end_time: string;
        location?: string;
    }): Promise<any> {
        return this.request('/timetable', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async deleteTimetableEntry(entryId: string): Promise<any> {
        return this.request(`/timetable/${entryId}`, {
            method: 'DELETE',
        });
    }

    // ============================================
    // CAMPUS UPDATES
    // ============================================

    async getActiveUpdate(campusId?: string): Promise<any> {
        const query = campusId ? `?campus_id=${campusId}` : '';
        return this.request(`/updates/active${query}`, {}, false);
    }
}

export const api = new CampusOSAPI();
