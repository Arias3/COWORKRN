import RobleAuthLoginRepository from '../../domain/repositories/RobleAuthLoginRepository';
import RobleAuthLoginDataSource from '../datasources/RobleAuthLoginDataSource';

/**
 * RobleAuthLoginRepositoryImpl
 * 
 * Implementation of RobleAuthLoginRepository.
 * Handles login operations through Roble Auth.
 */
export class RobleAuthLoginRepositoryImpl implements RobleAuthLoginRepository {
    constructor(private remoteDatasource: RobleAuthLoginDataSource) { }

    async loginRoble(email: string, password: string): Promise<Record<string, any>> {
        return this.remoteDatasource.login(email, password);
    }
}

export default RobleAuthLoginRepositoryImpl;
