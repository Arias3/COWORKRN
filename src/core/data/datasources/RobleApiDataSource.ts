import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import RobleConfig from '../database/RobleConfig';

/**
 * RobleApiDataSource
 * 
 * Base HTTP client for Roble API requests.
 * Handles authentication, CRUD operations, and table management.
 */
class RobleApiDataSource {
    private static readonly TIMEOUT_DURATION = 30000; // 30 seconds
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            timeout: RobleApiDataSource.TIMEOUT_DURATION,
        });
    }

    /**
     * Make HTTP request to Roble API
     */
    private async _makeRequest<T = any>(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        endpoint: string,
        options: {
            body?: any;
            queryParams?: Record<string, string>;
            isAuthRequest?: boolean;
        } = {}
    ): Promise<T> {
        try {
            const { body, queryParams, isAuthRequest = false } = options;

            const baseUrl = isAuthRequest ? RobleConfig.authUrl : RobleConfig.dataUrl;
            const headers = isAuthRequest ? RobleConfig.authHeaders : RobleConfig.dataHeaders;

            const config: AxiosRequestConfig = {
                method,
                url: `${baseUrl}/${endpoint}`,
                headers,
                params: queryParams,
                data: body,
            };

            const response: AxiosResponse<T> = await this.axiosInstance.request(config);

            if (response.status >= 200 && response.status < 300) {
                // Return empty object if response is empty
                if (!response.data || (typeof response.data === 'string' && response.data.trim() === '')) {
                    return {} as T;
                }
                return response.data;
            } else {
                throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`);
            }
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || error.message;
                throw new Error(`Error making ${method} request to ${endpoint}: ${message}`);
            }
            throw new Error(`Error making ${method} request to ${endpoint}: ${error.message}`);
        }
    }

    // ===== AUTHENTICATION METHODS =====

    /**
     * Login user
     */
    async login(email: string, password: string): Promise<Record<string, any>> {
        return this._makeRequest('POST', 'login', {
            body: { email, password },
            isAuthRequest: true,
        });
    }

    /**
     * Register new user
     */
    async register(email: string, password: string, name: string): Promise<Record<string, any>> {
        return this._makeRequest('POST', 'signup-direct', {
            body: { email, password, name },
            isAuthRequest: true,
        });
    }

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken: string): Promise<Record<string, any>> {
        return this._makeRequest('POST', 'refresh-token', {
            body: { refreshToken },
            isAuthRequest: true,
        });
    }

    /**
     * Logout user
     */
    async logout(accessToken: string): Promise<void> {
        await this._makeRequest('POST', 'logout', {
            isAuthRequest: true,
        });
    }

    // ===== TABLE SCHEMA MANAGEMENT =====

    /**
     * Create a new table in the database
     */
    async createTable(tableName: string, columns: Array<Record<string, any>>): Promise<void> {
        await this._makeRequest('POST', 'create-table', {
            body: {
                tableName,
                description: `Tabla ${tableName} para app móvil`,
                columns,
            },
        });
    }

    /**
     * Get table data structure
     */
    async getTableData(tableName: string): Promise<Record<string, any>> {
        return this._makeRequest('GET', 'table-data', {
            queryParams: { schema: 'public', table: tableName },
        });
    }

    // ===== CRUD METHODS =====

    /**
     * Create a new record
     */
    async create(tableName: string, data: Record<string, any>): Promise<Record<string, any>> {
        console.log('🔵 Sending data:', data);
        console.log('🔵 Table:', tableName);

        const response = await this._makeRequest<Record<string, any>>('POST', 'insert', {
            body: {
                tableName,
                records: [data],
            },
        });

        console.log('🔵 Complete response:', response);
        console.log('🔵 Inserted field:', response.inserted);

        if (response.inserted && Array.isArray(response.inserted) && response.inserted.length > 0) {
            return response.inserted[0];
        }

        if (Object.keys(response).length > 0) {
            return response;
        }

        throw new Error('Could not insert record');
    }

    /**
     * Read records from table
     */
    async read(
        tableName: string,
        filters?: Record<string, any>
    ): Promise<Array<Record<string, any>>> {
        const queryParams: Record<string, string> = { tableName };

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                queryParams[key] = String(value);
            });
        }

        const response = await this._makeRequest<any>('GET', 'read', {
            queryParams,
        });

        if (Array.isArray(response)) {
            return response;
        } else if (response && typeof response === 'object' && 'data' in response) {
            return Array.isArray(response.data) ? response.data : [];
        } else {
            return [];
        }
    }

    /**
     * Update a record
     */
    async update(
        tableName: string,
        id: any,
        data: Record<string, any>
    ): Promise<Record<string, any>> {
        // Remove _id and id from data to avoid conflicts
        const updateData = { ...data };
        delete updateData._id;
        delete updateData.id;

        return this._makeRequest('PUT', 'update', {
            body: {
                tableName,
                idColumn: '_id', // Use '_id' for Roble
                idValue: id,
                updates: updateData,
            },
        });
    }

    /**
     * Delete a record
     */
    async delete(tableName: string, id: any): Promise<Record<string, any>> {
        return this._makeRequest('DELETE', 'delete', {
            body: {
                tableName,
                idColumn: '_id', // Use '_id' for Roble
                idValue: id,
            },
        });
    }

    // ===== CONVENIENCE METHODS =====

    /**
     * Get all records from a table
     */
    async getAll(tableName: string): Promise<Array<Record<string, any>>> {
        return this.read(tableName);
    }

    /**
     * Get a single record by ID
     */
    async getById(tableName: string, id: any): Promise<Record<string, any> | null> {
        try {
            const results = await this.read(tableName, { _id: id });
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            console.error(`Error getting record by id from ${tableName}:`, error);
            return null;
        }
    }

    /**
     * Get records where column matches value
     */
    async getWhere(
        tableName: string,
        column: string,
        value: any
    ): Promise<Array<Record<string, any>>> {
        return this.read(tableName, { [column]: value });
    }
}

export default RobleApiDataSource;
