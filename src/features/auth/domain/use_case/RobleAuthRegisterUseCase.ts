import RobleAuthRepository from '../repositories/RobleAuthRepository';

/**
 * RobleAuthRegisterUseCase
 * 
 * Use case for registering new users with Roble Auth.
 */
export class RobleAuthRegisterUseCase {
    constructor(private repository: RobleAuthRepository) { }

    async call(email: string, password: string, name: string): Promise<boolean> {
        return this.repository.registerRoble(email, password, name);
    }
}

export default RobleAuthRegisterUseCase;
