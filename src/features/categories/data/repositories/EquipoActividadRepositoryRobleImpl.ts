/**
 * EquipoActividadRepositoryRobleImpl
 * 
 * Roble API implementation of IEquipoActividadRepository.
 * Handles team-activity assignment operations with Roble cloud database.
 */

import RobleApiDataSource from '../../../../core/data/datasources/RobleApiDataSource';
import { EquipoActividad } from '../../domain/entities/EquipoActividadEntity';
import { IEquipoActividadRepository } from '../../domain/repositories/EquipoActividadRepository';
import { RobleEquipoActividadDTO } from '../models/RobleEquipoActividadDTO';
import { EquipoRepositoryRobleImpl } from './EquipoRepositoryRobleImpl';

export class EquipoActividadRepositoryRobleImpl implements IEquipoActividadRepository {
  private dataSource: RobleApiDataSource;
  private static readonly tableName = 'equipo_actividades';
  private equipoRepository: EquipoRepositoryRobleImpl;

  constructor(dataSource: RobleApiDataSource, equipoRepository: EquipoRepositoryRobleImpl) {
    this.dataSource = dataSource;
    this.equipoRepository = equipoRepository;
  }

  /**
   * Helper function to convert DTO to entity with correct local equipoId
   */
  private dtoToEntity(dto: RobleEquipoActividadDTO, equipoIdLocal: number): EquipoActividad {
    return new EquipoActividad({
      id: dto.id,
      equipoId: equipoIdLocal, // Use local ID instead of Roble ID
      actividadId: dto.actividadId,
      asignadoEn: dto.asignadoEn ? new Date(dto.asignadoEn) : new Date(),
      fechaEntrega: dto.fechaEntrega ? new Date(dto.fechaEntrega) : undefined,
      estado: dto.estado,
      comentarioProfesor: dto.comentarioProfesor,
      calificacion: dto.calificacion,
      fechaCompletada: dto.fechaCompletada ? new Date(dto.fechaCompletada) : undefined,
    });
  }

  // ===================================================================
  // READ
  // ===================================================================

  async getAll(): Promise<EquipoActividad[]> {
    try {
      const data = await this.dataSource.getAll(EquipoActividadRepositoryRobleImpl.tableName);
      return data.map(json => RobleEquipoActividadDTO.fromJson(json).toEntity());
    } catch (e) {
      console.error('Error obteniendo equipo_actividades:', e);
      return [];
    }
  }

  async getByEquipoId(equipoId: number): Promise<EquipoActividad[]> {
    try {
      // Get Roble ID from team mapping
      const robleEquipoId = this.equipoRepository.obtenerRobleIdOriginal(equipoId);

      if (!robleEquipoId) {
        console.log(`❌ [EQUIPO-ACTIVIDAD] No se encontró mapeo Roble para equipo ID: ${equipoId}`);
        return [];
      }

      console.log(`🔍 [EQUIPO-ACTIVIDAD] Consultando actividades para equipo Roble ID: ${robleEquipoId} (Local ID: ${equipoId})`);

      const data = await this.dataSource.getWhere(
        EquipoActividadRepositoryRobleImpl.tableName,
        'equipo_id',
        robleEquipoId
      );

      console.log(`📊 [EQUIPO-ACTIVIDAD] Actividades encontradas: ${data.length}`);

      return data.map(json => {
        const dto = RobleEquipoActividadDTO.fromJson(json);
        return this.dtoToEntity(dto, equipoId);
      });
    } catch (e) {
      console.error(`Error obteniendo actividades por equipo ${equipoId}:`, e);
      return [];
    }
  }

  async getByActividadId(actividadId: string): Promise<EquipoActividad[]> {
    try {
      console.log(`🔍 [EQUIPO-ACTIVIDAD] Buscando equipos para actividad: ${actividadId}`);

      const data = await this.dataSource.getWhere(
        EquipoActividadRepositoryRobleImpl.tableName,
        'actividad_id',
        actividadId
      );

      console.log(`📊 [EQUIPO-ACTIVIDAD] Asignaciones encontradas: ${data.length}`);

      const asignaciones: EquipoActividad[] = [];

      for (const json of data) {
        const dto = RobleEquipoActividadDTO.fromJson(json);

        // Convert Roble team ID to local ID
        const equipoIdLocal = this.equipoRepository.obtenerIdLocal(dto.equipoId.toString());

        if (equipoIdLocal) {
          const asignacion = this.dtoToEntity(dto, equipoIdLocal);
          asignaciones.push(asignacion);
          console.log(`   ✅ Equipo ${dto.equipoId} (Roble) -> ${equipoIdLocal} (Local)`);
        } else {
          console.log(`   ❌ No se encontró mapeo local para equipo Roble: ${dto.equipoId}`);
        }
      }

      console.log(`🎯 [EQUIPO-ACTIVIDAD] Asignaciones válidas: ${asignaciones.length}`);
      return asignaciones;
    } catch (e) {
      console.error(`Error obteniendo equipos por actividad ${actividadId}:`, e);
      return [];
    }
  }

  async getByEquipoAndActividad(equipoId: number, actividadId: string): Promise<EquipoActividad | null> {
    try {
      // Get Roble ID from team
      const robleEquipoId = this.equipoRepository.obtenerRobleIdOriginal(equipoId);

      if (!robleEquipoId) {
        console.log(`❌ [EQUIPO-ACTIVIDAD] No se encontró mapeo Roble para equipo ID: ${equipoId}`);
        return null;
      }

      // Search by equipo_id and filter by actividad_id
      const data = await this.dataSource.getWhere(
        EquipoActividadRepositoryRobleImpl.tableName,
        'equipo_id',
        robleEquipoId
      );

      for (const json of data) {
        const dto = RobleEquipoActividadDTO.fromJson(json);
        if (dto.actividadId === actividadId) {
          return this.dtoToEntity(dto, equipoId);
        }
      }

      return null;
    } catch (e) {
      console.error('Error buscando equipo-actividad:', e);
      return null;
    }
  }

  // ===================================================================
  // CREATE
  // ===================================================================

  async create(equipoActividad: EquipoActividad): Promise<EquipoActividad> {
    try {
      // Convert local team ID to Roble ID
      const robleEquipoId = this.equipoRepository.obtenerRobleIdOriginal(equipoActividad.equipoId);

      if (!robleEquipoId) {
        throw new Error(`No se encontró ID de Roble para equipo: ${equipoActividad.equipoId}`);
      }

      // Create DTO with Roble team ID
      const dtoParaRoble = new RobleEquipoActividadDTO({
        equipoId: parseInt(robleEquipoId, 10) || 0,
        actividadId: equipoActividad.actividadId,
        asignadoEn: equipoActividad.asignadoEn.toISOString(),
        fechaEntrega: equipoActividad.fechaEntrega?.toISOString(),
        estado: equipoActividad.estado,
        comentarioProfesor: equipoActividad.comentarioProfesor,
        calificacion: equipoActividad.calificacion,
        fechaCompletada: equipoActividad.fechaCompletada?.toISOString(),
      });

      const response = await this.dataSource.create(
        EquipoActividadRepositoryRobleImpl.tableName,
        dtoParaRoble.toJson()
      );

      const createdId = response._id ?? response.id;

      return new EquipoActividad({
        ...equipoActividad,
        id: createdId?.toString(),
      });
    } catch (e) {
      console.error('Error creando equipo-actividad:', e);
      throw new Error(`No se pudo crear la asignación: ${e}`);
    }
  }

  // ===================================================================
  // UPDATE
  // ===================================================================

  async update(equipoActividad: EquipoActividad): Promise<EquipoActividad> {
    try {
      if (!equipoActividad.id) {
        throw new Error('EquipoActividad sin ID');
      }

      // Convert local team ID to Roble ID
      const robleEquipoId = this.equipoRepository.obtenerRobleIdOriginal(equipoActividad.equipoId);

      if (!robleEquipoId) {
        throw new Error(`No se encontró ID de Roble para equipo: ${equipoActividad.equipoId}`);
      }

      const dtoParaRoble = new RobleEquipoActividadDTO({
        id: equipoActividad.id,
        equipoId: parseInt(robleEquipoId, 10) || 0,
        actividadId: equipoActividad.actividadId,
        asignadoEn: equipoActividad.asignadoEn.toISOString(),
        fechaEntrega: equipoActividad.fechaEntrega?.toISOString(),
        estado: equipoActividad.estado,
        comentarioProfesor: equipoActividad.comentarioProfesor,
        calificacion: equipoActividad.calificacion,
        fechaCompletada: equipoActividad.fechaCompletada?.toISOString(),
      });

      await this.dataSource.update(
        EquipoActividadRepositoryRobleImpl.tableName,
        equipoActividad.id,
        dtoParaRoble.toJson()
      );

      return equipoActividad;
    } catch (e) {
      console.error('Error actualizando equipo-actividad:', e);
      throw new Error(`No se pudo actualizar la asignación: ${e}`);
    }
  }

  // ===================================================================
  // DELETE
  // ===================================================================

  async delete(id: string): Promise<void> {
    try {
      await this.dataSource.delete(EquipoActividadRepositoryRobleImpl.tableName, id);
    } catch (e) {
      console.error('Error eliminando equipo-actividad:', e);
      throw new Error(`No se pudo eliminar la asignación: ${e}`);
    }
  }

  async deleteByEquipoId(equipoId: number): Promise<void> {
    try {
      const asignaciones = await this.getByEquipoId(equipoId);

      for (const asignacion of asignaciones) {
        if (asignacion.id) {
          await this.delete(asignacion.id);
        }
      }
    } catch (e) {
      console.error('Error eliminando asignaciones por equipo:', e);
      throw new Error(`No se pudieron eliminar las asignaciones: ${e}`);
    }
  }

  async deleteByActividadId(actividadId: string): Promise<void> {
    try {
      const asignaciones = await this.getByActividadId(actividadId);

      for (const asignacion of asignaciones) {
        if (asignacion.id) {
          await this.delete(asignacion.id);
        }
      }
    } catch (e) {
      console.error('Error eliminando asignaciones por actividad:', e);
      throw new Error(`No se pudieron eliminar las asignaciones: ${e}`);
    }
  }
}

export default EquipoActividadRepositoryRobleImpl;
