/**
 * RobleAuthRepository
 * 
 * Repository interface for Roble authentication operations.
 */
export interface RobleAuthRepository {
    registerRoble(email: string, password: string, name: string): Promise<boolean>;
}

export default RobleAuthRepository;
