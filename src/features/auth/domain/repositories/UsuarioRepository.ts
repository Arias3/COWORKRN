import { Usuario } from '../entities/UserEntity';

/**
 * UsuarioRepository
 * 
 * Repository interface for user data operations.
 * Defines the contract for user CRUD operations.
 */
export interface UsuarioRepository {
    getUsuarios(): Promise<Usuario[]>;
    getUsuarioById(id: number): Promise<Usuario | null>;
    getUsuarioByEmail(email: string): Promise<Usuario | null>;
    createUsuario(usuario: Usuario): Promise<number>;
    updateUsuario(usuario: Usuario): Promise<void>;
    deleteUsuario(id: number): Promise<void>;
    existeEmail(email: string): Promise<boolean>;
    login(email: string, password: string): Promise<Usuario | null>;
    getUsuarioByAuthId(authUserId: string): Promise<Usuario | null>;
}

export default UsuarioRepository;
