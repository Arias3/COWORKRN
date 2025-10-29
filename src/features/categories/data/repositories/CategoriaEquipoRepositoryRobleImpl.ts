/**
 * CategoriaEquipoRepositoryRobleImpl
 * 
 * Roble API implementation of ICategoriaEquipoRepository.
 * Handles team category CRUD operations with Roble cloud database.
 */

import RobleApiDataSource from '../../../../core/data/datasources/RobleApiDataSource';
import { CategoriaEquipo } from '../../domain/entities/CategoriaEquipoEntity';
import { ICategoriaEquipoRepository } from '../../domain/repositories/CategoriaEquipoRepository';
import { RobleCategoriaEquipoDTO } from '../models/RobleCategoriaEquipoDTO';

export class CategoriaEquipoRepositoryRobleImpl implements ICategoriaEquipoRepository {
  private dataSource: RobleApiDataSource;
  private static readonly tableName = 'categorias_equipo';

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
      CategoriaEquipoRepositoryRobleImpl.robleToLocal.set(robleId, localId);
      CategoriaEquipoRepositoryRobleImpl.localToRoble.set(localId, robleId);
      console.log(`📋 [CATEGORIA] Mapeo ID guardado: "${robleId}" <-> ${localId}`);
    } catch (e) {
      console.warn('⚠️ [CATEGORIA] Error guardando mapeo:', e);
    }
  }

  /**
   * Get original Roble ID from local ID
   */
  private getRobleIdOriginal(localId: number): string | undefined {
    return CategoriaEquipoRepositoryRobleImpl.localToRoble.get(localId);
  }

  // ===================================================================
  // READ
  // ===================================================================

  async getCategoriasPorCurso(cursoId: number): Promise<CategoriaEquipo[]> {
    try {
      console.log(`🔍 [CATEGORIA] Obteniendo categorías para curso: ${cursoId}`);

      const data = await this.dataSource.getWhere(
        CategoriaEquipoRepositoryRobleImpl.tableName,
        'curso_id',
        cursoId
      );

      console.log(`📊 [CATEGORIA] Datos recibidos: ${data.length} categorías`);

      const categorias: CategoriaEquipo[] = [];

      for (const json of data) {
        try {
          const dto = RobleCategoriaEquipoDTO.fromJson(json);
          const categoria = dto.toEntity();

          // Save ID mapping if necessary
          if (dto.id && categoria.id) {
            this.saveIdMapping(dto.id, categoria.id);
          }

          categorias.push(categoria);
          console.log(`✅ [CATEGORIA] Categoría mapeada: ${categoria.nombre} (ID: ${categoria.id})`);
        } catch (e) {
          console.error('❌ [CATEGORIA] Error mapeando categoría individual:', e);
          console.error('❌ [CATEGORIA] JSON problemático:', json);
        }
      }

      console.log(`📈 [CATEGORIA] Total categorías procesadas: ${categorias.length}`);
      return categorias;
    } catch (e) {
      console.error('❌ [CATEGORIA] Error obteniendo categorías por curso:', e);
      return [];
    }
  }

  async getCategoriaById(id: number): Promise<CategoriaEquipo | null> {
    try {
      console.log(`🔍 [CATEGORIA] Obteniendo categoría por ID local: ${id}`);

      // Try to get original Roble ID
      const robleId = this.getRobleIdOriginal(id);

      if (robleId) {
        console.log(`🔄 [CATEGORIA] Buscando en Roble con ID original: ${robleId}`);
        const data = await this.dataSource.getById(
          CategoriaEquipoRepositoryRobleImpl.tableName,
          robleId
        );

        if (data) {
          const dto = RobleCategoriaEquipoDTO.fromJson(data);
          const categoria = dto.toEntity();
          console.log(`✅ [CATEGORIA] Categoría encontrada: ${categoria.nombre}`);
          return categoria;
        }
      } else {
        console.warn(`⚠️ [CATEGORIA] No se encontró mapeo para ID local: ${id}`);
      }

      return null;
    } catch (e) {
      console.error('❌ [CATEGORIA] Error obteniendo categoría por ID:', e);
      return null;
    }
  }

  // ===================================================================
  // CREATE
  // ===================================================================

  async createCategoria(categoria: CategoriaEquipo): Promise<number> {
    try {
      console.log(`🔍 [CATEGORIA] Creando categoría: ${categoria.nombre}`);

      const dto = RobleCategoriaEquipoDTO.fromEntity(categoria);
      const response = await this.dataSource.create(
        CategoriaEquipoRepositoryRobleImpl.tableName,
        dto.toJson()
      );

      console.log('🔵 [CATEGORIA] Respuesta de Roble:', response);

      // Extract ID from response
      const robleId = this.extractIdFromRobleResponse(response);

      if (robleId) {
        // Convert string ID to int using hash
        const localId = this.convertToValidId(robleId);

        if (localId && localId > 0) {
          this.saveIdMapping(robleId, localId);
          console.log(`✅ [CATEGORIA] Categoría creada con ID: ${localId}`);
          return localId;
        }
      }

      throw new Error('No se pudo extraer ID válido de la respuesta');
    } catch (e) {
      console.error('❌ [CATEGORIA] Error creando categoría:', e);
      throw new Error(`No se pudo crear la categoría: ${e}`);
    }
  }

  // ===================================================================
  // UPDATE
  // ===================================================================

  async updateCategoria(categoria: CategoriaEquipo): Promise<void> {
    try {
      if (!categoria.id) {
        throw new Error('Categoría sin ID');
      }

      // Get original Roble ID
      const robleId = this.getRobleIdOriginal(categoria.id);

      if (robleId) {
        const dto = RobleCategoriaEquipoDTO.fromEntity(categoria);
        await this.dataSource.update(
          CategoriaEquipoRepositoryRobleImpl.tableName,
          robleId,
          dto.toJson()
        );
        console.log(`✅ [CATEGORIA] Categoría actualizada en Roble con ID: ${robleId}`);
      } else {
        throw new Error('No se encontró ID de Roble para la categoría');
      }
    } catch (e) {
      console.error('❌ [CATEGORIA] Error actualizando categoría:', e);
      throw new Error(`No se pudo actualizar la categoría: ${e}`);
    }
  }

  // ===================================================================
  // DELETE
  // ===================================================================

  async deleteCategoria(id: number): Promise<void> {
    try {
      console.log(`🗑️ [CATEGORIA] Iniciando eliminación de categoría ID: ${id}`);

      // Get original Roble ID
      const robleId = this.getRobleIdOriginal(id);

      if (robleId) {
        console.log(`🔍 [CATEGORIA] ID de Roble encontrado: ${robleId}`);

        // Delete related equipos first using local converted ID
        console.log(`🔍 [CATEGORIA] Buscando equipos asociados con categoria_id: ${id}`);
        const equipos = await this.dataSource.getWhere(
          'equipos',
          'categoria_id',
          id // Use local converted ID instead of robleId
        );

        console.log(`📊 [CATEGORIA] Equipos encontrados: ${equipos.length}`);

        for (const equipo of equipos) {
          const equipoId = equipo._id ?? equipo.id;
          if (equipoId) {
            console.log(`🗑️ [CATEGORIA] Eliminando equipo: ${equipoId}`);
            await this.dataSource.delete('equipos', equipoId);
          }
        }

        // Delete the category using original Roble ID
        console.log(`🗑️ [CATEGORIA] Eliminando categoría con ID Roble: ${robleId}`);
        await this.dataSource.delete(
          CategoriaEquipoRepositoryRobleImpl.tableName,
          robleId
        );

        // Clear mappings
        CategoriaEquipoRepositoryRobleImpl.robleToLocal.delete(robleId);
        CategoriaEquipoRepositoryRobleImpl.localToRoble.delete(id);

        console.log('✅ [CATEGORIA] Categoría eliminada exitosamente');
      } else {
        console.warn(`⚠️ [CATEGORIA] No se encontró mapeo para ID: ${id}`);

        // Try direct deletion if no mapping
        console.log('🔄 [CATEGORIA] Intentando eliminación directa...');
        await this.dataSource.delete(
          CategoriaEquipoRepositoryRobleImpl.tableName,
          id.toString()
        );
      }
    } catch (e) {
      console.error('❌ [CATEGORIA] Error eliminando categoría:', e);
      throw new Error(`No se pudo eliminar la categoría: ${e}`);
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
      console.log('🔍 [CATEGORIA] Extrayendo ID de respuesta Roble...');

      if (!response) return null;

      // Case 1: Direct response with _id
      if (response._id) {
        return response._id.toString();
      }

      // Case 2: Response with id
      if (response.id) {
        return response.id.toString();
      }

      // Case 3: Structure {inserted: [...]}
      if (response.inserted && Array.isArray(response.inserted) && response.inserted.length > 0) {
        const firstItem = response.inserted[0];
        if (firstItem) {
          const rawId = firstItem._id ?? firstItem.id;
          return rawId?.toString();
        }
      }

      return response.toString();
    } catch (e) {
      console.error('❌ [CATEGORIA] Error extrayendo ID:', e);
      return null;
    }
  }

  /**
   * Convert string ID to valid numeric ID
   */
  private convertToValidId(robleId: string): number | null {
    try {
      if (!robleId || robleId.length === 0) return null;

      // Check if mapping already exists
      const existingLocalId = CategoriaEquipoRepositoryRobleImpl.robleToLocal.get(robleId);
      if (existingLocalId) {
        return existingLocalId;
      }

      // Use deterministic function instead of hashCode.abs()
      const validId = RobleCategoriaEquipoDTO.generateConsistentId(robleId);
      const finalId = validId === 0 ? 1 : validId;

      console.log(`✅ [CATEGORIA] String convertido: "${robleId}" -> ${finalId}`);
      return finalId;
    } catch (e) {
      console.error('❌ [CATEGORIA] Error en conversión:', e);
      return null;
    }
  }
}

export default CategoriaEquipoRepositoryRobleImpl;
