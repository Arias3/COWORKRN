import axios from 'axios';

/**
 * RobleAuthLoginDataSource
 * 
 * Data source for Roble authentication login operations.
 */
export class RobleAuthLoginDataSource {
    private readonly baseUrl = 'https://roble-api.openlab.uninorte.edu.co/auth/coworkapp_dd7a0b82de';

    async login(email: string, password: string): Promise<Record<string, any>> {
        try {
            const url = `${this.baseUrl}/login`;
            const response = await axios.post(
                url,
                { email, password },
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            console.log(`RobleAuth login status: \x1b[33m${response.status}\x1b[0m`);
            console.log(`RobleAuth login body: \x1b[36m${JSON.stringify(response.data)}\x1b[0m`);

            if (response.status === 200 || response.status === 201) {
                return response.data;
            } else {
                throw new Error(`Unexpected status: ${response.status}`);
            }
        } catch (error: any) {
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

            console.log('RobleAuth login error:', errorMsg);
            throw new Error(`RobleAuth login error: ${errorMsg}`);
        }
    }
}

export default RobleAuthLoginDataSource;
