/**
 * setupActivityDI
 * 
 * Initializes and registers Activity-related dependencies
 * in the DependencyInjection container.
 */

import RobleApiDataSource from '../../../../core/data/datasources/RobleApiDataSource';
import DependencyInjection from '../../../../core/di/DependencyInjection';
import { UsuarioRepositoryRobleImpl } from '../../../auth/data/repositories/UsuarioRepositoryRobleImpl';
import { CategoriaEquipoRepositoryRobleImpl } from '../../../categories/data/repositories/CategoriaEquipoRepositoryRobleImpl';
import { EquipoActividadRepositoryRobleImpl } from '../../../categories/data/repositories/EquipoActividadRepositoryRobleImpl';
import { EquipoRepositoryRobleImpl } from '../../../categories/data/repositories/EquipoRepositoryRobleImpl';
import { CategoriaEquipoUseCase } from '../../../categories/domain/usecases/CategoriaEquipoUseCase';
import { EquipoActividadUseCase } from '../../../categories/domain/usecases/EquipoActividadUseCase';
import { ActivityRepositoryRobleImpl } from '../../data/repositories/ActivityRepositoryRobleImpl';
import { ActivityUseCase } from '../../domain/usecases/ActivityUseCase';
import { ActivityController } from './ActivityController';

/**
 * Register all activity-related dependencies
 */
export function setupActivityDI(): void {
    console.log('📦 Setting up Activity DI...');

    try {
        // Check if already registered
        if (DependencyInjection.has('ActivityController')) {
            console.log('⚠️ ActivityController already registered');
            return;
        }

        // Get or create RobleApiDataSource
        let robleApiDataSource: RobleApiDataSource;
        if (DependencyInjection.has('RobleApiDataSource')) {
            robleApiDataSource = DependencyInjection.resolve<RobleApiDataSource>('RobleApiDataSource');
        } else {
            robleApiDataSource = new RobleApiDataSource();
            DependencyInjection.register('RobleApiDataSource', robleApiDataSource);
        }

        // Register Activity Repository
        const activityRepository = new ActivityRepositoryRobleImpl(robleApiDataSource);
        DependencyInjection.register('ActivityRepository', activityRepository);

        // Register CategoriaEquipo Repository
        let categoriaEquipoRepository: CategoriaEquipoRepositoryRobleImpl;
        if (DependencyInjection.has('CategoriaEquipoRepository')) {
            categoriaEquipoRepository = DependencyInjection.resolve<CategoriaEquipoRepositoryRobleImpl>('CategoriaEquipoRepository');
        } else {
            categoriaEquipoRepository = new CategoriaEquipoRepositoryRobleImpl(robleApiDataSource);
            DependencyInjection.register('CategoriaEquipoRepository', categoriaEquipoRepository);
        }

        // Register Equipo Repository
        let equipoRepository: EquipoRepositoryRobleImpl;
        if (DependencyInjection.has('EquipoRepository')) {
            equipoRepository = DependencyInjection.resolve<EquipoRepositoryRobleImpl>('EquipoRepository');
        } else {
            equipoRepository = new EquipoRepositoryRobleImpl(robleApiDataSource);
            DependencyInjection.register('EquipoRepository', equipoRepository);
        }

        // Register EquipoActividad Repository
        let equipoActividadRepository: EquipoActividadRepositoryRobleImpl;
        if (DependencyInjection.has('EquipoActividadRepository')) {
            equipoActividadRepository = DependencyInjection.resolve<EquipoActividadRepositoryRobleImpl>('EquipoActividadRepository');
        } else {
            // EquipoActividadRepository needs EquipoRepository as dependency
            equipoActividadRepository = new EquipoActividadRepositoryRobleImpl(robleApiDataSource, equipoRepository);
            DependencyInjection.register('EquipoActividadRepository', equipoActividadRepository);
        }

        // Register Usuario Repository
        let usuarioRepository: UsuarioRepositoryRobleImpl;
        if (DependencyInjection.has('UsuarioRepository')) {
            usuarioRepository = DependencyInjection.resolve<UsuarioRepositoryRobleImpl>('UsuarioRepository');
        } else {
            usuarioRepository = new UsuarioRepositoryRobleImpl();
            DependencyInjection.register('UsuarioRepository', usuarioRepository);
        }

        // Register UseCases
        const activityUseCase = new ActivityUseCase(activityRepository);
        DependencyInjection.register('ActivityUseCase', activityUseCase);

        const categoriaEquipoUseCase = new CategoriaEquipoUseCase(
            categoriaEquipoRepository,
            equipoRepository,
            usuarioRepository
        );
        DependencyInjection.register('CategoriaEquipoUseCase', categoriaEquipoUseCase);

        const equipoActividadUseCase = new EquipoActividadUseCase(
            equipoActividadRepository
        );
        DependencyInjection.register('EquipoActividadUseCase', equipoActividadUseCase);

        // Register ActivityController with all dependencies
        const activityController = new ActivityController(
            activityRepository,
            categoriaEquipoUseCase,
            equipoActividadUseCase
        );
        DependencyInjection.register('ActivityController', activityController);

        console.log('✅ ActivityController and dependencies registered successfully');
    } catch (error) {
        console.error('❌ Error setting up Activity DI:', error);
        throw error;
    }
}

export default setupActivityDI;
