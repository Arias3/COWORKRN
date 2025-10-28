/**
 * AppRoutes
 * 
 * Centralized route definitions for navigation.
 * Equivalent to Flutter's app_routes.dart
 */
class AppRoutes {
    // Auth routes
    static readonly LOGIN = '/login' as const;
    static readonly REGISTER = '/register' as const;

    // Home routes
    static readonly HOME = '/home' as const;
    static readonly NEW_COURSE = '/new-course' as const;
    static readonly ENROLL_COURSE = '/enroll-course' as const;
    static readonly ESTUDIANTE_CURSO_DETALLE = '/estudiante-curso-detalle' as const;

    // Categories routes
    static readonly CATEGORIA_EQUIPOS = '/categoria-equipos' as const;
    static readonly EDITAR_ESTUDIANTES_CATEGORIA = '/editar-estudiantes-categoria' as const;

    // Activities routes
    static readonly ACTIVITIES = '/activities' as const;
    static readonly ADD_ACTIVITY = '/add-activity' as const;
    static readonly EDIT_ACTIVITY = '/edit-activity' as const;
    static readonly ASSIGN_ACTIVITY = '/assign-activity' as const;

    // Evaluations routes
    static readonly EVALUACIONES = '/evaluaciones' as const;
    static readonly CREAR_EVALUACION = '/crear-evaluacion' as const;
    static readonly EVALUACION_DETALLE = '/evaluacion-detalle' as const;
    static readonly REALIZAR_EVALUACION = '/realizar-evaluacion' as const;

    // Settings routes
    static readonly SETTINGS = '/settings' as const;
}

export default AppRoutes;
