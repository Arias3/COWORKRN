import axios from 'axios';

/**
 * RobleAuthLogoutDataSource
 * 
 * Data source for Roble authentication logout operations.
 */
export class RobleAuthLogoutDataSource {
    private readonly baseUrl = 'https://roble-api.openlab.uninorte.edu.co/auth/coworkapp_dd7a0b82de';

    async logout(accessToken: string): Promise<boolean> {
        try {
            const url = `${this.baseUrl}/logout`;
            const response = await axios.post(
                url,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                }
            );

            if (response.status === 200 || response.status === 204) {
                return true;
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

            console.log('RobleAuth logout error:', errorMsg);
            throw new Error(`RobleAuth logout error: ${errorMsg}`);
        }
    }
}

export default RobleAuthLogoutDataSource;
