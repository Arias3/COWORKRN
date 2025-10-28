import RobleAuthRepository from '../../domain/repositories/RobleAuthRepository';
import { RobleAuthDataSource } from '../datasources/RobleAuthRegisterDataSource';

/**
 * RobleAuthRepositoryImpl
 * 
 * Implementation of RobleAuthRepository.
 * Handles registration operations through Roble Auth.
 */
export class RobleAuthRepositoryImpl implements RobleAuthRepository {
    constructor(private remoteDatasource: RobleAuthDataSource) { }

    async registerRoble(email: string, password: string, name: string): Promise<boolean> {
        return this.remoteDatasource.register(email, password, name);
    }
}

export default RobleAuthRepositoryImpl;
