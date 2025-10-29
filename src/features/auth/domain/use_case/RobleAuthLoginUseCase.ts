import RobleAuthLoginRepository from '../repositories/RobleAuthLoginRepository';

/**
 * RobleAuthLoginUseCase
 * 
 * Use case for authenticating users with Roble Auth.
 */
export class RobleAuthLoginUseCase {
    constructor(private repository: RobleAuthLoginRepository) { }

    async call(email: string, password: string): Promise<Record<string, any>> {
        return this.repository.loginRoble(email, password);
    }
}

export default RobleAuthLoginUseCase;
