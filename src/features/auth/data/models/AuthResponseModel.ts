/**
 * AuthResponseModel
 * 
 * Model for authentication response from Roble API.
 * Contains access and refresh tokens.
 */
export class AuthResponseModel {
    accessToken: string;
    refreshToken: string;

    constructor(accessToken: string, refreshToken: string) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    static fromJson(json: Record<string, any>): AuthResponseModel {
        return new AuthResponseModel(
            json.accessToken,
            json.refreshToken
        );
    }

    toJson(): Record<string, any> {
        return {
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
        };
    }
}

export default AuthResponseModel;
