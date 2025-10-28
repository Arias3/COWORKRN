import { Usuario } from '../entities/UserEntity';
import UsuarioRepository from '../repositories/UsuarioRepository';

/**
 * UsuarioUseCase
 * 
 * Use case for user management operations.
 * Handles user CRUD operations, role detection, and auth integration.
 */
export class UsuarioUseCase {
    constructor(private repository: UsuarioRepository) { }

    // ========================================================================
    // BASIC CRUD OPERATIONS
    // ========================================================================

    async getUsuarios(): Promise<Usuario[]> {
        return this.repository.getUsuarios();
    }

    async getUsuarioById(id: number): Promise<Usuario | null> {
        return this.repository.getUsuarioById(id);
    }

    async getUsuarioByEmail(email: string): Promise<Usuario | null> {
        return this.repository.getUsuarioByEmail(email);
    }

    // ========================================================================
    // CREATE USUARIO (ORIGINAL METHOD - MAINTAINS COMPATIBILITY)
    // ========================================================================

    async createUsuario(data: {
        nombre: string;
        email: string;
        password: string;
        rol: 'profesor' | 'estudiante';
    }): Promise<number> {
        // Validations
        if (data.nombre.trim() === '') throw new Error('El nombre es obligatorio');
        if (data.email.trim() === '') throw new Error('El email es obligatorio');
        if (data.password.trim() === '')
            throw new Error('La contraseña es obligatoria');

        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(data.email)) {
            throw new Error('Email no válido');
        }

        // Check if email already exists
        if (await this.repository.existeEmail(data.email)) {
            throw new Error('Este email ya está registrado');
        }

        // Generate unique ID
        const usuarios = await this.repository.getUsuarios();
        const nuevoId = usuarios.length === 0
            ? 1
            : Math.max(...usuarios.map(u => u.id!)) + 1;

        const usuario = new Usuario({
            id: nuevoId,
            nombre: data.nombre.trim(),
            email: data.email.trim().toLowerCase(),
            password: data.password,
            rol: data.rol,
        });

        return this.repository.createUsuario(usuario);
    }

    // ========================================================================
    // CREATE USUARIO FROM AUTH (NO PASSWORD REQUIRED)
    // ========================================================================

    async createUsuarioFromAuth(data: {
        nombre: string;
        email: string;
        authUserId?: string;
        rol?: 'profesor' | 'estudiante';
    }): Promise<number | null> {
        console.log('DEBUG createUsuarioFromAuth:', {
            email: data.email,
            rolReceived: data.rol,
        });

        try {
            // Basic validations
            if (data.nombre.trim() === '') throw new Error('El nombre es obligatorio');
            if (data.email.trim() === '') throw new Error('El email es obligatorio');

            const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
            if (!emailRegex.test(data.email)) {
                throw new Error('Email no válido');
            }

            // Clean email
            const emailLimpio = data.email.trim().toLowerCase();

            // Check if user already exists
            const usuarioExistente = await this.repository.getUsuarioByEmail(emailLimpio);
            if (usuarioExistente) {
                console.log('Usuario ya existe:', usuarioExistente.id);
                return usuarioExistente.id ?? null;
            }

            // Detect role automatically (ignore "user" from RobleAuth)
            const rolFinal = !data.rol || data.rol === ('user' as any)
                ? this.detectarRolPorEmail(emailLimpio)
                : data.rol;

            console.log('Rol final asignado:', rolFinal);

            // Generate unique ID
            const usuarios = await this.repository.getUsuarios();
            const nuevoId = usuarios.length === 0
                ? 1
                : Math.max(...usuarios.map(u => u.id!)) + 1;

            const usuario = new Usuario({
                id: nuevoId,
                nombre: data.nombre.trim(),
                email: emailLimpio,
                authUserId: data.authUserId,
                rol: rolFinal as 'profesor' | 'estudiante',
                password: undefined, // RobleAuth doesn't manage local passwords
            });

            console.log(`Creating user from Auth: ${data.nombre} (${emailLimpio}) as ${rolFinal}`);

            const resultId = await this.repository.createUsuario(usuario);

            console.log('Usuario creado exitosamente con ID:', resultId);
            return resultId;
        } catch (e) {
            console.error('Error creando usuario desde Auth:', e);
            return null;
        }
    }

    // ========================================================================
    // ROLE DETECTION
    // ========================================================================

    /**
     * Detect role automatically based on email
     */
    detectarRolPorEmail(email: string): 'profesor' | 'estudiante' {
        const emailLimpio = email.trim();
        const emailLower = emailLimpio.toLowerCase();

        console.log('DEBUG detectarRolPorEmail:', {
            original: email,
            clean: emailLimpio,
            lower: emailLower,
        });

        // Institutional emails
        if (emailLower.includes('@uninorte.edu.co')) {
            console.log('Dominio institucional detectado');
            if (/^(profesor|docente|teacher)\./.test(emailLower)) {
                console.log('Prefijo detectado: profesor → rol="profesor"');
                return 'profesor';
            }
            console.log('Prefijo no detectado → rol="estudiante"');
            return 'estudiante';
        }

        // External emails
        if (emailLower.includes('admin') || emailLower.includes('administrador')) {
            console.log('Email contiene "admin" → rol="admin" (defaulting to profesor)');
            return 'profesor'; // Admin is treated as profesor
        }
        if (
            emailLower.includes('profesor') ||
            emailLower.includes('teacher') ||
            emailLower.includes('docente')
        ) {
            console.log('Email contiene palabra clave → rol="profesor"');
            return 'profesor';
        }

        console.log('Ninguna regla coincide → rol="estudiante"');
        return 'estudiante';
    }

    // ========================================================================
    // GET OR CREATE USER FROM AUTH
    // ========================================================================

    async obtenerOCrearUsuarioAuth(data: {
        nombre: string;
        email: string;
        authUserId?: string;
        rolSeleccionado?: 'profesor' | 'estudiante';
    }): Promise<Usuario | null> {
        try {
            const emailLimpio = data.email.trim().toLowerCase();

            // Try to get existing user first
            const usuarioExistente = await this.repository.getUsuarioByEmail(emailLimpio);
            if (usuarioExistente) {
                console.log(`Usuario existente encontrado: ${usuarioExistente.nombre} (${usuarioExistente.rol})`);
                return usuarioExistente;
            }

            // New user - use selected role or auto-detect
            const rolFinal = data.rolSeleccionado || this.detectarRolPorEmail(emailLimpio);

            console.log('Usuario nuevo detectado. Rol sugerido:', rolFinal);

            // Create user
            const nuevoId = await this.createUsuarioFromAuth({
                nombre: data.nombre,
                email: emailLimpio,
                authUserId: data.authUserId,
                rol: rolFinal,
            });

            if (nuevoId) {
                return this.repository.getUsuarioById(nuevoId);
            }

            return null;
        } catch (e) {
            console.error('Error obteniendo o creando usuario desde Auth:', e);
            return null;
        }
    }

    // ========================================================================
    // OTHER OPERATIONS
    // ========================================================================

    async updateUsuario(usuario: Usuario): Promise<void> {
        return this.repository.updateUsuario(usuario);
    }

    async deleteUsuario(id: number): Promise<void> {
        return this.repository.deleteUsuario(id);
    }

    async login(email: string, password: string): Promise<Usuario | null> {
        return this.repository.login(email, password);
    }

    async getUsuarioByAuthId(authUserId: string): Promise<Usuario | null> {
        return this.repository.getUsuarioByAuthId(authUserId);
    }
}

export default UsuarioUseCase;
