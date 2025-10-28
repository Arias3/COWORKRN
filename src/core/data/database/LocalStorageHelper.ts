import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * LocalStorageHelper
 * 
 * Helper class for managing local storage operations using AsyncStorage.
 * Equivalent to Flutter's HiveHelper but adapted for React Native.
 * 
 * Note: Activities are migrated to Roble API and no longer stored locally.
 */
class LocalStorageHelper {
    // Storage keys
    private static readonly USUARIOS_KEY = 'usuarios';
    private static readonly CURSOS_KEY = 'cursos';
    private static readonly INSCRIPCIONES_KEY = 'inscripciones';
    private static readonly CATEGORIAS_EQUIPO_KEY = 'categorias_equipo';
    private static readonly EQUIPOS_KEY = 'equipos';
    private static readonly ACTIVITIES_KEY = 'activities'; // Deprecated - migrated to Roble

    /**
     * Initialize storage and load initial data if needed
     */
    static async init(): Promise<void> {
        try {
            // Check if initial data needs to be loaded
            await this._loadInitialData();

            // Clean up old activities data (migrated to Roble)
            try {
                await AsyncStorage.removeItem(this.ACTIVITIES_KEY);
                console.log('📋 Old activities storage cleaned successfully');
            } catch (e) {
                console.warn('⚠️ Error cleaning old activities storage:', e);
            }

            console.log('✅ LocalStorageHelper initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing LocalStorageHelper:', error);
            throw error;
        }
    }

    /**
     * Load initial test data if storage is empty
     */
    private static async _loadInitialData(): Promise<void> {
        try {
            // Load usuarios if empty
            const usuarios = await this.getUsuarios();
            if (usuarios.length === 0) {
                const testUsuarios = [
                    {
                        id: 1,
                        nombre: 'Profesor A',
                        email: 'a@a.com',
                        password: '123456',
                        rol: 'profesor',
                    },
                    {
                        id: 2,
                        nombre: 'Estudiante B',
                        email: 'b@b.com',
                        password: '123456',
                        rol: 'estudiante',
                    },
                    {
                        id: 3,
                        nombre: 'Estudiante C',
                        email: 'c@c.com',
                        password: '123456',
                        rol: 'estudiante',
                    },
                    {
                        id: 4,
                        nombre: 'María González',
                        email: 'maria@test.com',
                        password: '123456',
                        rol: 'estudiante',
                    },
                    {
                        id: 5,
                        nombre: 'Juan Pérez',
                        email: 'juan@test.com',
                        password: '123456',
                        rol: 'estudiante',
                    },
                    {
                        id: 6,
                        nombre: 'Ana Silva',
                        email: 'ana@test.com',
                        password: '123456',
                        rol: 'estudiante',
                    },
                ];
                await this.setUsuarios(testUsuarios);
            }

            // Load cursos if empty
            const cursos = await this.getCursos();
            if (cursos.length === 0) {
                const testCursos = [
                    {
                        id: 1,
                        nombre: 'Cálculo Diferencial',
                        descripcion: 'Curso completo de cálculo diferencial para ingeniería',
                        profesorId: 1,
                        codigoRegistro: 'CAL001',
                        imagen: 'assets/images/calculo.png',
                        categorias: ['Matemáticas', 'Ciencias'],
                        estudiantesNombres: ['Ana García', 'Luis Martínez'],
                    },
                    {
                        id: 2,
                        nombre: 'Análisis de Datos',
                        descripcion: 'Aprende a analizar datos con Python y R',
                        profesorId: 1,
                        codigoRegistro: 'ANA002',
                        imagen: 'assets/images/analisis.png',
                        categorias: ['Programación', 'Tecnología'],
                        estudiantesNombres: ['Carlos Ruiz'],
                    },
                    {
                        id: 3,
                        nombre: 'Flutter Avanzado',
                        descripcion: 'Desarrollo de aplicaciones móviles avanzadas',
                        profesorId: 1,
                        codigoRegistro: 'FLU003',
                        imagen: 'assets/images/flutter.png',
                        categorias: ['Programación', 'Tecnología'],
                        estudiantesNombres: [],
                    },
                ];
                await this.setCursos(testCursos);
            }

            // Load inscripciones if empty
            const inscripciones = await this.getInscripciones();
            if (inscripciones.length === 0) {
                const testInscripciones = [
                    { id: 1, usuarioId: 2, cursoId: 3 },
                    { id: 2, usuarioId: 3, cursoId: 3 },
                    { id: 3, usuarioId: 4, cursoId: 3 },
                    { id: 4, usuarioId: 5, cursoId: 3 },
                    { id: 5, usuarioId: 6, cursoId: 3 },
                ];
                await this.setInscripciones(testInscripciones);
            }

            // Load categorias equipo if empty
            const categorias = await this.getCategoriasEquipo();
            if (categorias.length === 0) {
                const testCategorias = [
                    {
                        id: 1,
                        nombre: 'Proyecto Final',
                        cursoId: 3,
                        tipoAsignacion: 'manual',
                        maxEstudiantesPorEquipo: 4,
                        equiposIds: [],
                        equiposGenerados: false,
                    },
                    {
                        id: 2,
                        nombre: 'Laboratorio 1',
                        cursoId: 3,
                        tipoAsignacion: 'aleatoria',
                        maxEstudiantesPorEquipo: 3,
                        equiposIds: [],
                        equiposGenerados: false,
                    },
                ];
                await this.setCategoriasEquipo(testCategorias);
            }

            // Equipos will be created when professor generates teams or students join manually
            // For now, we leave the equipos storage empty to demonstrate functionality
        } catch (error) {
            console.error('Error loading initial data:', error);
            throw error;
        }
    }

    // ==================== USUARIOS ====================
    static async getUsuarios(): Promise<any[]> {
        try {
            const data = await AsyncStorage.getItem(this.USUARIOS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error getting usuarios:', error);
            return [];
        }
    }

    static async setUsuarios(usuarios: any[]): Promise<void> {
        try {
            await AsyncStorage.setItem(this.USUARIOS_KEY, JSON.stringify(usuarios));
        } catch (error) {
            console.error('Error setting usuarios:', error);
            throw error;
        }
    }

    static async getUsuarioById(id: number): Promise<any | null> {
        const usuarios = await this.getUsuarios();
        return usuarios.find(u => u.id === id) || null;
    }

    static async addUsuario(usuario: any): Promise<void> {
        const usuarios = await this.getUsuarios();
        usuarios.push(usuario);
        await this.setUsuarios(usuarios);
    }

    static async updateUsuario(id: number, updatedUsuario: any): Promise<void> {
        const usuarios = await this.getUsuarios();
        const index = usuarios.findIndex(u => u.id === id);
        if (index !== -1) {
            usuarios[index] = { ...usuarios[index], ...updatedUsuario };
            await this.setUsuarios(usuarios);
        }
    }

    // ==================== CURSOS ====================
    static async getCursos(): Promise<any[]> {
        try {
            const data = await AsyncStorage.getItem(this.CURSOS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error getting cursos:', error);
            return [];
        }
    }

    static async setCursos(cursos: any[]): Promise<void> {
        try {
            await AsyncStorage.setItem(this.CURSOS_KEY, JSON.stringify(cursos));
        } catch (error) {
            console.error('Error setting cursos:', error);
            throw error;
        }
    }

    static async getCursoById(id: number): Promise<any | null> {
        const cursos = await this.getCursos();
        return cursos.find(c => c.id === id) || null;
    }

    static async addCurso(curso: any): Promise<void> {
        const cursos = await this.getCursos();
        cursos.push(curso);
        await this.setCursos(cursos);
    }

    // ==================== INSCRIPCIONES ====================
    static async getInscripciones(): Promise<any[]> {
        try {
            const data = await AsyncStorage.getItem(this.INSCRIPCIONES_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error getting inscripciones:', error);
            return [];
        }
    }

    static async setInscripciones(inscripciones: any[]): Promise<void> {
        try {
            await AsyncStorage.setItem(this.INSCRIPCIONES_KEY, JSON.stringify(inscripciones));
        } catch (error) {
            console.error('Error setting inscripciones:', error);
            throw error;
        }
    }

    static async addInscripcion(inscripcion: any): Promise<void> {
        const inscripciones = await this.getInscripciones();
        inscripciones.push(inscripcion);
        await this.setInscripciones(inscripciones);
    }

    // ==================== CATEGORIAS EQUIPO ====================
    static async getCategoriasEquipo(): Promise<any[]> {
        try {
            const data = await AsyncStorage.getItem(this.CATEGORIAS_EQUIPO_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error getting categorias equipo:', error);
            return [];
        }
    }

    static async setCategoriasEquipo(categorias: any[]): Promise<void> {
        try {
            await AsyncStorage.setItem(this.CATEGORIAS_EQUIPO_KEY, JSON.stringify(categorias));
        } catch (error) {
            console.error('Error setting categorias equipo:', error);
            throw error;
        }
    }

    static async getCategoriaEquipoById(id: number): Promise<any | null> {
        const categorias = await this.getCategoriasEquipo();
        return categorias.find(c => c.id === id) || null;
    }

    static async addCategoriaEquipo(categoria: any): Promise<void> {
        const categorias = await this.getCategoriasEquipo();
        categorias.push(categoria);
        await this.setCategoriasEquipo(categorias);
    }

    // ==================== EQUIPOS ====================
    static async getEquipos(): Promise<any[]> {
        try {
            const data = await AsyncStorage.getItem(this.EQUIPOS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error getting equipos:', error);
            return [];
        }
    }

    static async setEquipos(equipos: any[]): Promise<void> {
        try {
            await AsyncStorage.setItem(this.EQUIPOS_KEY, JSON.stringify(equipos));
        } catch (error) {
            console.error('Error setting equipos:', error);
            throw error;
        }
    }

    static async addEquipo(equipo: any): Promise<void> {
        const equipos = await this.getEquipos();
        equipos.push(equipo);
        await this.setEquipos(equipos);
    }

    // ==================== UTILITIES ====================
    /**
     * Clear all storage
     */
    static async clearAll(): Promise<void> {
        try {
            await AsyncStorage.clear();
            console.log('🗑️ All storage cleared');
        } catch (error) {
            console.error('Error clearing storage:', error);
            throw error;
        }
    }

    /**
     * Clear specific key
     */
    static async clearKey(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(key);
            console.log(`🗑️ Storage key "${key}" cleared`);
        } catch (error) {
            console.error(`Error clearing key "${key}":`, error);
            throw error;
        }
    }
}

export default LocalStorageHelper;
