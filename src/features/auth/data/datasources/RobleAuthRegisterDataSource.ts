import axios from 'axios';

/**
 * RobleAuthDataSource
 * 
 * Data source for Roble authentication registration operations.
 */
export class RobleAuthDataSource {
    private readonly baseUrl = 'https://roble-api.openlab.uninorte.edu.co/auth/coworkapp_dd7a0b82de';

    async register(email: string, password: string, name: string): Promise<boolean> {
        try {
            const url = `${this.baseUrl}/signup-direct`;
            const requestBody = { email, password, name };

            console.log('RobleAuth register URL:', url);
            console.log('RobleAuth register body:', JSON.stringify(requestBody));

            const response = await axios.post(
                url,
                requestBody,
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            console.log('RobleAuth register status:', response.status);
            console.log('RobleAuth register response:', JSON.stringify(response.data));

            if (response.status === 200 || response.status === 201) {
                return true;
            } else {
                throw new Error(`Unexpected status: ${response.status}`);
            }
        } catch (error: any) {
            // Extract error message from backend if exists
            let errorMsg = 'Error desconocido';

            if (axios.isAxiosError(error)) {
                if (error.response?.data) {
                    const decoded = error.response.data;
                    if (typeof decoded === 'object' && 'message' in decoded) {
                        errorMsg = decoded.message;
                    } else {
                        errorMsg = JSON.stringify(decoded);
                    }
                } else {
                    errorMsg = error.message;
                }
            } else {
                errorMsg = error.message || String(error);
            }

            console.log('RobleAuth error:', errorMsg);
            throw new Error(`RobleAuth error: ${errorMsg}`);
        }
    }
}

export default RobleAuthDataSource;
