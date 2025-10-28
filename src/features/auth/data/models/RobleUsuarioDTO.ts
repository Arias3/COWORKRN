import { Usuario } from '../../domain/entities/UserEntity';

/**
 * RobleUsuarioDto
 * 
 * Data Transfer Object for Usuario.
 * Handles conversion between Roble API format and domain entity.
 */
export class RobleUsuarioDto {
    id?: string; // Keep as Roble string ID
    nombre: string;
    email: string;
    password?: string; // Now optional (nullable)
    rol: string;
    authUserId?: string;
    creadoEn?: string;

    constructor(data: {
        id?: string;
        nombre: string;
        email: string;
        password?: string;
        rol: string;
        authUserId?: string;
        creadoEn?: string;
    }) {
        this.id = data.id;
        this.nombre = data.nombre;
        this.email = data.email;
        this.password = data.password;
        this.rol = data.rol;
        this.authUserId = data.authUserId;
        this.creadoEn = data.creadoEn;
    }

    static fromJson(json: Record<string, any>): RobleUsuarioDto {
        console.log('🔍 [DTO] JSON received from Roble:', json);

        const robleId = json._id ?? json.id;
        console.log(`🆔 [DTO] ID extracted: "${robleId}" (type: ${typeof robleId})`);

        const dto = new RobleUsuarioDto({
            id: robleId?.toString(),
            nombre: json.nombre ?? json.name ?? '',
            email: json.email ?? '',
            password: json.password, // Can be null
            rol: json.rol ?? json.role ?? 'estudiante',
            authUserId: json.auth_user_id ?? json.authUserId,
            creadoEn: json.creado_en ?? json.created_at,
        });

        console.log(
            `📋 [DTO] DTO created - ID: "${dto.id}", Name: "${dto.nombre}", Role: "${dto.rol}"`
        );
        return dto;
    }

    static fromEntity(usuario: Usuario): RobleUsuarioDto {
        console.log('📤 [DTO] Converting Usuario to DTO...');
        console.log('   - Usuario ID:', usuario.id);
        console.log('   - Usuario robleId:', usuario.robleId);

        const robleId = usuario.robleId;

        return new RobleUsuarioDto({
            id: robleId,
            nombre: usuario.nombre,
            email: usuario.email,
            password: !usuario.password || usuario.password === ''
                ? undefined
                : usuario.password, // Won't break anymore
            rol: usuario.rol,
            authUserId: usuario.authUserId,
            creadoEn: usuario.creadoEn.toISOString(),
        });
    }

    toEntity(): Usuario {
        console.log('🔄 [DTO] Converting DTO to Usuario...');
        console.log('   - Roble ID:', this.id);
        console.log('   - Name:', this.nombre);
        console.log('   - Role:', this.rol);

        let finalId: number | undefined;

        if (this.id && this.id.length > 0) {
            // ✅ FIXED: Use deterministic function instead of hashCode
            finalId = this._generateConsistentId(this.id);
        } else if (this.email.length > 0) {
            // ✅ FIXED: Also for email
            finalId = this._generateConsistentId(this.email);
        } else {
            finalId = Date.now() % 0x7FFFFFFF;
        }

        const usuario = new Usuario({
            id: finalId,
            nombre: this.nombre,
            email: this.email,
            password: this.password ?? '', // Never null in entity
            rol: this.rol as 'profesor' | 'estudiante',
            authUserId: this.authUserId,
            robleId: this.id,
            creadoEn: this.creadoEn
                ? new Date(this.creadoEn)
                : new Date(),
        });

        console.log(
            `✅ [DTO] Final Usuario: ${usuario.nombre} (ID: ${usuario.id}, Role: ${usuario.rol}, RobleID: ${usuario.robleId})`
        );
        return usuario;
    }

    toJson(): Record<string, any> {
        const json: Record<string, any> = {
            nombre: this.nombre,
            email: this.email.toLowerCase().trim(),
            rol: this.rol,
            creado_en: this.creadoEn ?? new Date().toISOString(),
        };

        // Only add password if it exists
        if (this.password) {
            json.password = this.password;
        }

        if (this.id && this.id.length > 0) {
            json._id = this.id;
        }
        if (this.authUserId && this.authUserId.length > 0) {
            json.auth_user_id = this.authUserId;
        }

        console.log('📤 [DTO] JSON for Roble:', json);
        return json;
    }

    /**
     * ✅ ADDED METHOD: Generate consistent ID across platforms
     * Instead of using hashCode (which varies between web/mobile),
     * use a deterministic function based on character codes
     */
    private _generateConsistentId(input: string): number {
        if (input.length === 0) return 1;

        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            hash = (hash * 31 + input.charCodeAt(i)) & 0x7FFFFFFF;
        }

        // Ensure it's never 0
        return hash === 0 ? 1 : hash;
    }
}

export default RobleUsuarioDto;
