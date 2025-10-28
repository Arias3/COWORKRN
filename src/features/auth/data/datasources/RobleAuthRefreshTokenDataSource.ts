import axios from 'axios';

/**
 * RobleAuthRefreshTokenDataSource
 * 
 * Data source for refreshing authentication tokens.
 */
export class RobleAuthRefreshTokenDataSource {
    private readonly baseUrl = 'https://roble-api.openlab.uninorte.edu.co/auth/coworkapp_dd7a0b82de';

    async refreshToken(refreshToken: string): Promise<string> {
        try {
            const url = `${this.baseUrl}/refresh-token`;
            const response = await axios.post(
                url,
                { refreshToken },
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            if (response.status === 200) {
                const decoded = response.data;
                if (typeof decoded === 'object' && 'accessToken' in decoded) {
                    return decoded.accessToken;
                } else {
                    throw new Error('No se recibió accessToken en la respuesta');
                }
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

            console.log('RobleAuth refresh error:', errorMsg);
            throw new Error(`RobleAuth refresh error: ${errorMsg}`);
        }
    }
}

export default RobleAuthRefreshTokenDataSource;
