import RobleApiDataSource from '../../../../core/data/datasources/RobleApiDataSource';
import { Usuario } from '../../domain/entities/UserEntity';
import UsuarioRepository from '../../domain/repositories/UsuarioRepository';
import RobleUsuarioDto from '../models/RobleUsuarioDTO';

/**
 * UsuarioRepositoryRobleImpl
 * 
 * Roble implementation of UsuarioRepository.
 * Manages user data through Roble API.
 */
export class UsuarioRepositoryRobleImpl implements UsuarioRepository {
    private dataSource: RobleApiDataSource;
    private static readonly TABLE_NAME = 'usuarios';

    constructor() {
        this.dataSource = new RobleApiDataSource();
    }

    async getUsuarios(): Promise<Usuario[]> {
        try {
            const data = await this.dataSource.getAll(UsuarioRepositoryRobleImpl.TABLE_NAME);
            return data.map(json => RobleUsuarioDto.fromJson(json).toEntity());
        } catch (e) {
            console.error('Error obteniendo usuarios de Roble:', e);
            return [];
        }
    }

    async getUsuarioById(id: number): Promise<Usuario | null> {
        try {
            console.log('[ROBLE] Buscando usuario con ID:', id);

            // First try to get directly by ID
            const data = await this.dataSource.getById(UsuarioRepositoryRobleImpl.TABLE_NAME, id.toString());
            if (data) {
                const usuario = RobleUsuarioDto.fromJson(data).toEntity();
                console.log('[ROBLE] Usuario encontrado por ID directo:', usuario.nombre);
                return usuario;
            }

            // If not found, search in all users and compare with generated ID
            console.log('[ROBLE] No encontrado por ID directo, buscando en todos los usuarios...');
            const todosUsuarios = await this.dataSource.getAll(UsuarioRepositoryRobleImpl.TABLE_NAME);

            for (const userData of todosUsuarios) {
                const usuario = RobleUsuarioDto.fromJson(userData).toEntity();

                // Compare with both direct ID and generated ID
                if (usuario.id === id) {
                    console.log('[ROBLE] Usuario encontrado por coincidencia:', usuario.nombre);
                    return usuario;
                }

                // Also check if searched ID matches email-generated ID
                const idGenerado = this._generateConsistentId(usuario.email);
                if (idGenerado === id) {
                    console.log('[ROBLE] Usuario encontrado por ID generado desde email:', usuario.nombre);
                    return usuario;
                }

                // If user has a Roble _id, check with that too
                if (userData._id) {
                    const idGeneradoRoble = this._generateConsistentId(userData._id.toString());
                    if (idGeneradoRoble === id) {
                        console.log('[ROBLE] Usuario encontrado por ID generado desde _id de Roble:', usuario.nombre);
                        return usuario;
                    }
                }
            }

            console.log('[ROBLE] Usuario con ID', id, 'no encontrado en ninguna estrategia');
            return null;
        } catch (e) {
            console.error('[ROBLE] Error obteniendo usuario por ID:', e);
            return null;
        }
    }

    async getUsuarioByEmail(email: string): Promise<Usuario | null> {
        try {
            const data = await this.dataSource.getWhere(UsuarioRepositoryRobleImpl.TABLE_NAME, 'email', email);
            return data.length > 0
                ? RobleUsuarioDto.fromJson(data[0]).toEntity()
                : null;
        } catch (e) {
            console.error('Error obteniendo usuario por email de Roble:', e);
            return null;
        }
    }

    async createUsuario(usuario: Usuario): Promise<number> {
        try {
            const dto = RobleUsuarioDto.fromEntity(usuario);

            console.log('[ROBLE] Creando usuario:', usuario.nombre, `(${usuario.email})`);
            console.log('[ROBLE] DTO JSON:', dto.toJson());

            const response = await this.dataSource.create(UsuarioRepositoryRobleImpl.TABLE_NAME, dto.toJson());
            console.log('[ROBLE] Respuesta completa de creacion usuario:', response);

            // Extract ID from response according to Roble API structure
            let nuevoId: number;

            // Response has structure: {inserted: [{_id: "...", ...}], skipped: []}
            if (
                response.inserted &&
                Array.isArray(response.inserted) &&
                response.inserted.length > 0
            ) {
                const insertedItem = response.inserted[0];
                const robleId = insertedItem._id;

                console.log('[ROBLE] ID extraido de inserted[0][_id]:', robleId);

                if (robleId) {
                    nuevoId = this._generateConsistentId(robleId.toString());
                } else {
                    nuevoId = this._generateConsistentId(usuario.email);
                }
            } else {
                // Fallback: generate consistent ID based on email
                nuevoId = this._generateConsistentId(usuario.email);
                console.log('[ROBLE] Fallback - ID generado para email:', usuario.email);
            }

            console.log('[ROBLE] Usuario creado con ID final:', nuevoId);
            return nuevoId;
        } catch (e) {
            console.error('[ROBLE] Error creando usuario:', e);
            throw new Error(`No se pudo crear el usuario: ${e}`);
        }
    }

    async updateUsuario(usuario: Usuario): Promise<void> {
        try {
            const dto = RobleUsuarioDto.fromEntity(usuario);
            await this.dataSource.update(UsuarioRepositoryRobleImpl.TABLE_NAME, usuario.id!.toString(), dto.toJson());
        } catch (e) {
            console.error('Error actualizando usuario en Roble:', e);
            throw new Error(`No se pudo actualizar el usuario: ${e}`);
        }
    }

    async deleteUsuario(id: number): Promise<void> {
        try {
            await this.dataSource.delete(UsuarioRepositoryRobleImpl.TABLE_NAME, id.toString());
        } catch (e) {
            console.error('Error eliminando usuario de Roble:', e);
            throw new Error(`No se pudo eliminar el usuario: ${e}`);
        }
    }

    async existeEmail(email: string): Promise<boolean> {
        try {
            const usuario = await this.getUsuarioByEmail(email);
            return usuario !== null;
        } catch (e) {
            console.error('Error verificando email en Roble:', e);
            return false;
        }
    }

    async login(email: string, password: string): Promise<Usuario | null> {
        try {
            const usuario = await this.getUsuarioByEmail(email);
            return usuario;
        } catch (e) {
            console.error('Error en login de Roble:', e);
            return null;
        }
    }

    async getUsuarioByAuthId(authUserId: string): Promise<Usuario | null> {
        try {
            const data = await this.dataSource.getWhere(
                UsuarioRepositoryRobleImpl.TABLE_NAME,
                'auth_user_id',
                authUserId
            );
            return data.length > 0
                ? RobleUsuarioDto.fromJson(data[0]).toEntity()
                : null;
        } catch (e) {
            console.error('Error obteniendo usuario por auth ID de Roble:', e);
            return null;
        }
    }

    // ========================================================================
    // DETERMINISTIC FUNCTION FOR CROSS-PLATFORM CONSISTENT IDs
    // ========================================================================
    private _generateConsistentId(input: string): number {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash + char) & 0x7FFFFFFF;
        }
        return hash === 0 ? 1 : hash; // Avoid 0
    }
}

export default UsuarioRepositoryRobleImpl;
