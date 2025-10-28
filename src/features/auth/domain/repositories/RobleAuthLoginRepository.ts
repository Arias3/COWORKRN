/**
 * RobleAuthLoginRepository
 * 
 * Repository interface for Roble authentication login operations.
 */
export interface RobleAuthLoginRepository {
    loginRoble(email: string, password: string): Promise<Record<string, any>>;
}

export default RobleAuthLoginRepository;
