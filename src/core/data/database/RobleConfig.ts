/**
 * RobleConfig
 * 
 * Configuration class for Roble API endpoints and authentication.
 * Manages base URLs, access tokens, and headers for API requests.
 */
class RobleConfig {
    // Use your project for everything (auth and data)
    private static readonly BASE_URL = 'https://roble-api.openlab.uninorte.edu.co';
    private static readonly DB_NAME = 'coworkapp_dd7a0b82de'; // Your project
    private static accessToken: string | null = null;

    // URLs for auth and data in your project
    static get authUrl(): string {
        return `${this.BASE_URL}/auth/${this.DB_NAME}`;
    }

    static get dataUrl(): string {
        return `${this.BASE_URL}/database/${this.DB_NAME}`;
    }

    static get authHeaders(): Record<string, string> {
        return {
            'Content-Type': 'application/json',
        };
    }

    static get dataHeaders(): Record<string, string> {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken ?? ''}`,
        };
    }

    static useRoble = true;

    static setAccessToken(token: string): void {
        this.accessToken = token;
    }

    static clearTokens(): void {
        this.accessToken = null;
    }

    static getAccessToken(): string | null {
        return this.accessToken;
    }
}

export default RobleConfig;
