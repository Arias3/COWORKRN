/**
 * EquipoRepositoryRobleImpl
 * 
 * Roble API implementation of IEquipoRepository.
 * Handles team CRUD operations with Roble cloud database.
 */

import RobleApiDataSource from '../../../../core/data/datasources/RobleApiDataSource';
import { Equipo } from '../../domain/entities/EquipoEntity';
import { IEquipoRepository } from '../../domain/repositories/EquipoRepository';
import { RobleEquipoDTO } from '../models/RobleEquipoDTO';

export class EquipoRepositoryRobleImpl implements IEquipoRepository {
  private dataSource: RobleApiDataSource;
  private static readonly tableName = 'equipos';

  // ID mapping for consistency
  private static robleToLocal: Map<string, number> = new Map();
  private static localToRoble: Map<number, string> = new Map();

  constructor(dataSource: RobleApiDataSource) {
    this.dataSource = dataSource;
  }

  /**
   * Save ID mapping
   */
  private saveIdMapping(robleId: string, localId: number): void {
    try {
      EquipoRepositoryRobleImpl.robleToLocal.set(robleId, localId);
      EquipoRepositoryRobleImpl.localToRoble.set(localId, robleId);
      console.log(`Mapeo ID guardado: "${robleId}" <-> ${localId}`);
    } catch (e) {
      console.warn('Error guardando mapeo:', e);
    }
  }

  /**
   * Get original Roble ID from local ID
   */
  private getRobleIdOriginal(localId: number): string | undefined {
    return EquipoRepositoryRobleImpl.localToRoble.get(localId);
  }

  /**
   * Get local ID from Roble ID (public for external access)
   */
  public obtenerIdLocal(robleId: string): number | undefined {
    return EquipoRepositoryRobleImpl.robleToLocal.get(robleId);
  }

  /**
   * Get Roble ID from local ID (public for external access)
   */
  public obtenerRobleIdOriginal(localId: number): string | undefined {
    return this.getRobleIdOriginal(localId);
  }

  // ===================================================================
  // READ
  // ===================================================================

  async getEquiposPorCategoria(categoriaId: number): Promise<Equipo[]> {
    try {
      const data = await this.dataSource.getWhere(
        EquipoRepositoryRobleImpl.tableName,
        'categoria_id',
        categoriaId
      );

      const equipos: Equipo[] = [];

      for (const json of data) {
        try {
          const dto = RobleEquipoDTO.fromJson(json);
          const equipo = dto.toEntity();

          if (dto.id && equipo.id) {
            this.saveIdMapping(dto.id, equipo.id);
          }

          equipos.push(equipo);
        } catch (e) {
          console.error('Error mapeando equipo:', e);
        }
      }

      return equipos;
    } catch (e) {
      console.error('Error obteniendo equipos:', e);
      return [];
    }
  }

  async getEquipoById(id: number): Promise<Equipo | null> {
    try {
      const robleId = this.getRobleIdOriginal(id);

      if (robleId) {
        const data = await this.dataSource.getById(
          EquipoRepositoryRobleImpl.tableName,
          robleId
        );

        if (data) {
          const dto = RobleEquipoDTO.fromJson(data);
          return dto.toEntity();
        }
      }

      return null;
    } catch (e) {
      console.error('Error obteniendo equipo:', e);
      return null;
    }
  }

  async getEquipoByStringId(equipoId: string): Promise<Equipo | null> {
    try {
      console.log('=== DEBUG MAPEO ===');
      console.log('Buscando equipo con ID:', equipoId);
      console.log('Mapeos actuales localToRoble:', EquipoRepositoryRobleImpl.localToRoble);
      console.log('Mapeos actuales robleToLocal:', EquipoRepositoryRobleImpl.robleToLocal);

      // STEP 1: Try as local ID converted to Roble ID
      try {
        const intId = parseInt(equipoId, 10);
        if (!isNaN(intId)) {
          const robleId = this.getRobleIdOriginal(intId);

          console.log(`DEBUG: intId = ${intId}, robleId = ${robleId}`);

          if (robleId) {
            console.log(`🔄 [EQUIPO] Buscando en Roble con ID: ${robleId}`);
            const data = await this.dataSource.getById(
              EquipoRepositoryRobleImpl.tableName,
              robleId
            );

            console.log('DEBUG: data recibido =', data);

            if (data) {
              console.log('✅ [EQUIPO] Data encontrado, creando DTO...');
              const dto = RobleEquipoDTO.fromJson(data);
              const equipo = dto.toEntity();
              console.log(`✅ [EQUIPO] Equipo creado: ${equipo.nombre}`);
              return equipo;
            } else {
              console.log(`❌ [EQUIPO] Data es null para Roble ID: ${robleId}`);
            }
          } else {
            console.log(`❌ [EQUIPO] robleId es null para intId: ${intId}`);
          }
        }
      } catch (e) {
        console.error('❌ [EQUIPO] Error en conversión/mapeo:', e);
      }

      // STEP 2: Try direct search as Roble ID
      try {
        console.log(`🔄 [EQUIPO] Intentando búsqueda directa con ID: ${equipoId}`);
        const data = await this.dataSource.getById(
          EquipoRepositoryRobleImpl.tableName,
          equipoId
        );

        if (data) {
          const dto = RobleEquipoDTO.fromJson(data);
          const equipo = dto.toEntity();
          console.log(`✅ [EQUIPO] Encontrado por búsqueda directa: ${equipo.nombre}`);
          return equipo;
        }
      } catch (e) {
        console.error('❌ [EQUIPO] Error en búsqueda directa:', e);
      }

      console.log('❌ [EQUIPO] No se encontró el equipo con ningún método');
      return null;
    } catch (e) {
      console.error('❌ [EQUIPO] Error general:', e);
      return null;
    }
  }

  async getEquipoPorEstudiante(estudianteId: number, categoriaId: number): Promise<Equipo | null> {
    try {
      const equipos = await this.getEquiposPorCategoria(categoriaId);

      for (const equipo of equipos) {
        if (equipo.estudiantesIds.includes(estudianteId)) {
          return equipo;
        }
      }

      return null;
    } catch (e) {
      console.error('Error buscando equipo por estudiante:', e);
      return null;
    }
  }

  // ===================================================================
  // CREATE
  // ===================================================================

  async createEquipo(equipo: Equipo): Promise<string> {
    try {
      const dto = RobleEquipoDTO.fromEntity(equipo);
      const response = await this.dataSource.create(
        EquipoRepositoryRobleImpl.tableName,
        dto.toJson()
      );

      const robleId = this.extractIdFromRobleResponse(response);

      if (robleId) {
        const localId = this.convertToValidId(robleId);

        if (localId && localId > 0) {
          this.saveIdMapping(robleId, localId);
          return robleId;
        }
      }

      throw new Error('No se pudo extraer ID válido');
    } catch (e) {
      console.error('Error creando equipo:', e);
      throw new Error(`No se pudo crear el equipo: ${e}`);
    }
  }

  // ===================================================================
  // UPDATE
  // ===================================================================

  async updateEquipo(equipo: Equipo): Promise<void> {
    try {
      if (!equipo.id) {
        throw new Error('Equipo sin ID');
      }

      const robleId = this.getRobleIdOriginal(equipo.id);

      if (robleId) {
        const dto = RobleEquipoDTO.fromEntity(equipo);
        await this.dataSource.update(
          EquipoRepositoryRobleImpl.tableName,
          robleId,
          dto.toJson()
        );
      } else {
        throw new Error('No se encontró ID de Roble para el equipo');
      }
    } catch (e) {
      console.error('Error actualizando equipo:', e);
      throw new Error(`No se pudo actualizar el equipo: ${e}`);
    }
  }

  // ===================================================================
  // DELETE
  // ===================================================================

  async deleteEquipo(id: number): Promise<void> {
    try {
      const robleId = this.getRobleIdOriginal(id);

      if (robleId) {
        await this.dataSource.delete(EquipoRepositoryRobleImpl.tableName, robleId);

        EquipoRepositoryRobleImpl.robleToLocal.delete(robleId);
        EquipoRepositoryRobleImpl.localToRoble.delete(id);
      } else {
        await this.dataSource.delete(EquipoRepositoryRobleImpl.tableName, id.toString());
      }
    } catch (e) {
      console.error('Error eliminando equipo:', e);
      throw new Error(`No se pudo eliminar el equipo: ${e}`);
    }
  }

  async deleteEquiposPorCategoria(categoriaId: number): Promise<void> {
    try {
      const equipos = await this.getEquiposPorCategoria(categoriaId);

      for (const equipo of equipos) {
        if (equipo.id) {
          await this.deleteEquipo(equipo.id);
        }
      }
    } catch (e) {
      console.error('Error eliminando equipos por categoría:', e);
      throw new Error(`No se pudieron eliminar los equipos: ${e}`);
    }
  }

  // ===================================================================
  // HELPER METHODS
  // ===================================================================

  /**
   * Extract ID from Roble response
   */
  private extractIdFromRobleResponse(response: any): string | null {
    try {
      if (!response) return null;

      if (response._id) return response._id.toString();
      if (response.id) return response.id.toString();

      if (response.inserted && Array.isArray(response.inserted) && response.inserted.length > 0) {
        const firstItem = response.inserted[0];
        if (firstItem) {
          const rawId = firstItem._id ?? firstItem.id;
          return rawId?.toString();
        }
      }

      return response.toString();
    } catch (e) {
      console.error('Error extrayendo ID:', e);
      return null;
    }
  }

  /**
   * Convert string ID to valid numeric ID
   */
  private convertToValidId(robleId: string): number | null {
    try {
      if (!robleId || robleId.length === 0) return null;

      const existingLocalId = EquipoRepositoryRobleImpl.robleToLocal.get(robleId);
      if (existingLocalId) {
        return existingLocalId;
      }

      const validId = RobleEquipoDTO.generateConsistentId(robleId);
      const finalId = validId === 0 ? 1 : validId;

      return finalId;
    } catch (e) {
      console.error('Error en conversión:', e);
      return null;
    }
  }
}

export default EquipoRepositoryRobleImpl;
