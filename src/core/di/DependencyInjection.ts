import LocalStorageHelper from '../data/database/LocalStorageHelper';
import RobleConfig from '../data/database/RobleConfig';
import RobleApiDataSource from '../data/datasources/RobleApiDataSource';

/**
 * DependencyInjection
 * 
 * Central dependency injection setup for the application.
 * Registers all repositories, use cases, and services.
 * Equivalent to Flutter's dependency_injection.dart
 */
class DependencyInjection {
    private static instance: DependencyInjection;
    private services: Map<string, any> = new Map();
    private initialized: boolean = false;

    private constructor() { }

    static getInstance(): DependencyInjection {
        if (!DependencyInjection.instance) {
            DependencyInjection.instance = new DependencyInjection();
        }
        return DependencyInjection.instance;
    }

    /**
     * Initialize all dependencies
     */
    async init(): Promise<void> {
        if (this.initialized) {
            console.log('⚠️ DependencyInjection already initialized');
            return;
        }

        console.log('\n=== INITIATING DEPENDENCY INJECTION ===');

        try {
            // Initialize local storage
            await LocalStorageHelper.init();
            console.log('✅ LocalStorageHelper initialized');

            // Register core services
            this.registerCoreServices();

            // Register datasources
            this.registerDataSources();

            // Register repositories
            this.registerRepositories();

            // Register use cases
            this.registerUseCases();

            this.initialized = true;
            console.log('✅ DEPENDENCY INJECTION COMPLETED\n');
        } catch (error) {
            console.error('❌ Error initializing DependencyInjection:', error);
            throw error;
        }
    }

    /**
     * Register core services
     */
    private registerCoreServices(): void {
        console.log('📦 Registering core services...');

        // Register RobleConfig (static, no need to register)
        // Register RobleApiDataSource
        const robleApiDataSource = new RobleApiDataSource();
        this.register('RobleApiDataSource', robleApiDataSource);

        console.log('✅ Core services registered');
    }

    /**
     * Register data sources
     */
    private registerDataSources(): void {
        console.log('📦 Registering datasources...');

        // Auth datasources will be registered here when migrated
        // Example:
        // const authLoginDs = new RobleAuthLoginDataSource();
        // this.register('RobleAuthLoginDataSource', authLoginDs);

        console.log('✅ Datasources registered');
    }

    /**
     * Register repositories
     */
    private registerRepositories(): void {
        console.log('📦 Registering repositories...');
        console.log(`RobleConfig.useRoble = ${RobleConfig.useRoble}`);
        console.log(`RobleConfig.dataUrl = ${RobleConfig.dataUrl}`);
        console.log(`RobleConfig.authUrl = ${RobleConfig.authUrl}`);

        // Clear existing repositories if any
        this.clearRepositories();

        // Register Roble repositories only
        console.log('📋 Registering ROBLE repositories only...');

        // Repositories will be registered here as they are migrated
        // Example:
        // const cursoRepo = new CursoRepositoryRobleImpl();
        // this.register('CursoRepository', cursoRepo);

        console.log('✅ All ROBLE repositories registered');

        // Verification
        this.verifyRepositories();
    }

    /**
     * Clear existing repositories
     */
    private clearRepositories(): void {
        const repoKeys = [
            'CursoRepository',
            'InscripcionRepository',
            'UsuarioRepository',
            'CategoriaEquipoRepository',
            'EquipoRepository',
            'EquipoActividadRepository',
            'ActivityRepository',
            'EvaluacionPeriodoRepository',
            'EvaluacionIndividualRepository',
            'RobleAuthLoginRepository',
            'RobleAuthRepository',
        ];

        repoKeys.forEach(key => {
            if (this.services.has(key)) {
                this.services.delete(key);
            }
        });

        console.log('🗑️ Cleared existing repositories');
    }

    /**
     * Verify repositories are registered
     */
    private verifyRepositories(): void {
        console.log('\n=== REPOSITORY VERIFICATION ===');

        const repoKeys = Array.from(this.services.keys()).filter(key =>
            key.includes('Repository')
        );

        if (repoKeys.length === 0) {
            console.log('⚠️ No repositories registered yet');
        } else {
            repoKeys.forEach(key => {
                const repo = this.services.get(key);
                console.log(`✅ ${key}: ${repo?.constructor?.name || 'Unknown'}`);
            });
        }

        console.log('=== END VERIFICATION ===\n');
    }

    /**
     * Register use cases
     */
    private registerUseCases(): void {
        console.log('📦 Registering use cases...');

        // Use cases will be registered here as they are migrated
        // Example:
        // const cursoUseCase = new CursoUseCase(
        //   this.resolve('CursoRepository'),
        //   this.resolve('InscripcionRepository')
        // );
        // this.register('CursoUseCase', cursoUseCase);

        console.log('✅ Use cases registered');
    }

    /**
     * Register a service
     */
    register<T>(key: string, instance: T): void {
        this.services.set(key, instance);
    }

    /**
     * Resolve a service
     */
    resolve<T>(key: string): T {
        if (!this.services.has(key)) {
            throw new Error(`Service not found: ${key}`);
        }
        return this.services.get(key) as T;
    }

    /**
     * Check if service exists
     */
    has(key: string): boolean {
        return this.services.has(key);
    }

    /**
     * Reset all dependencies (useful for testing)
     */
    reset(): void {
        this.services.clear();
        this.initialized = false;
        console.log('🔄 DependencyInjection reset');
    }

    /**
     * Get all registered service keys
     */
    getRegisteredServices(): string[] {
        return Array.from(this.services.keys());
    }
}

// Export singleton instance
export default DependencyInjection.getInstance();