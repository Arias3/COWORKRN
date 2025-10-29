# Métodos Faltantes en Controllers de React Native

Este documento identifica los métodos implementados en los controladores de Flutter (`lib/`) que NO están presentes en los controladores de React Native (`src/`).

---

## 1. ActivityController

### ✅ Métodos Implementados en React Native:
- `loadActivitiesByCategoria(categoriaId)`
- `createActivity(activity, onSuccess, onError)`
- `updateActivity(activity, onSuccess, onError)`
- `deleteActivity(id, onSuccess, onError)`
- `refreshData()`

### ❌ Métodos Faltantes (en Flutter pero NO en React Native):

#### **Gestión de Equipos y Asignación:**
```typescript
// Flutter tiene estos métodos que faltan en React Native:

1. loadCategoriasPorCurso(cursoId: number): Promise<void>
   - Carga categorías de un curso para poder listar equipos

2. loadEquiposPorCategoria(categoriaId: number): Promise<void>
   - Carga equipos disponibles de una categoría

3. toggleEquipoSelection(equipoId: number): void
   - Alterna la selección de un equipo (para UI de checkboxes)

4. selectAllTeams(): void
   - Selecciona todos los equipos disponibles

5. selectTeamsWithoutActivity(equiposConActividad: number[]): void
   - Selecciona solo equipos que NO tienen la actividad asignada

6. getEquiposConActividad(actividadId: string): Promise<number[]>
   - Retorna IDs de equipos que ya tienen asignada una actividad

7. equipoTieneActividad(equipoId: number, actividadId: string): Promise<boolean>
   - Verifica si un equipo específico tiene una actividad asignada

8. clearEquiposSelection(): void
   - Limpia la selección de equipos

9. isEquipoSelected(equipoId: number): boolean
   - Verifica si un equipo está seleccionado

10. assignActivityToSelectedTeams(activity: Activity): Promise<void>
    - Asigna una actividad a los equipos seleccionados
    - Este método es CRÍTICO para ActivityAssignmentScreen

11. getActividadesAsignadasAEquipo(equipoId: number): Promise<Activity[]>
    - Obtiene las actividades asignadas a un equipo específico

12. deleteActivitiesByCategory(categoryId: number): Promise<void>
    - Elimina todas las actividades de una categoría
```

**Estado Variables Faltantes:**
```typescript
// Flutter tiene estas variables observables:
private _categorias: CategoriaEquipo[] = [];
private _equiposDisponibles: Equipo[] = [];
private _equiposSeleccionados: number[] = [];
isLoadingTeams: boolean = false;
```

---

## 2. CategoriaEquipoController

### ✅ Métodos Implementados en React Native:
- `loadCategoriasPorCurso(curso)`
- `loadEquiposPorCategoria(categoriaId)`
- `createCategoria(nombre, descripcion, onSuccess, onError)`
- `deleteCategoria(id, onSuccess, onError)`
- `createEquipo(nombre, onSuccess, onError)`
- `deleteEquipo(id, onSuccess, onError)`
- `addStudentToTeam(equipoId, estudianteId, onSuccess, onError)`
- `removeStudentFromTeam(equipoId, estudianteId, onSuccess, onError)`
- `selectCategoria(categoria)`
- `refreshData()`

### ❌ Métodos Faltantes (en Flutter pero NO en React Native):

#### **UI y Diálogos (Estos son específicos de Flutter/GetX, no necesarios en React Native):**
- `mostrarDialogoCrearCategoria()` ❌ No necesario (React Native usa navegación)
- `mostrarDialogoEditarCategoria()` ❌ No necesario
- `mostrarDialogoCrearEquipo()` ❌ No necesario
- `mostrarDialogoEliminarCategoria()` ❌ No necesario

#### **Gestión de Equipos Aleatorios:**
```typescript
1. generarEquiposAleatorios(): Promise<void>
   - Genera equipos de manera aleatoria según configuración
   - Distribuye estudiantes automáticamente
   - CRÍTICO: Mencionado en CategoriasEquipoScreen pero no implementado
```

#### **Gestión de Permisos:**
```typescript
2. esProfesorDelCurso(curso: CursoDomain): boolean
   - Verifica si el usuario actual es profesor del curso

3. esProfesorDelCursoActual: boolean (getter)
   - Propiedad computada para verificar permisos rápidamente

4. esProfesor: boolean (getter)
   - Alias de esProfesorDelCursoActual
```

#### **Caché y Optimización:**
```typescript
5. _isCacheValid(): boolean
   - Verifica si el caché de datos sigue válido (5 minutos)

6. _updateCacheTimestamp(): void
   - Actualiza el timestamp del caché

7. _clearCache(): void
   - Limpia todo el caché de categorías y equipos
```

#### **Gestión de Estado de Formularios:**
```typescript
// Variables que faltan:
nombreCategoriaController: TextEditingController // No necesario en RN
nombreEquipoController: TextEditingController     // No necesario en RN
tipoAsignacionSeleccionado: TipoAsignacion
maxEstudiantesPorEquipo: number
selectedTab: number
```

---

## 3. EditarEstudiantesCategoriaController

### ❌ **COMPLETAMENTE FALTANTE** en React Native

Este controlador NO EXISTE en React Native. Por eso EditarEstudiantesCategoriaScreen es un placeholder.

#### **Métodos Necesarios:**
```typescript
1. inicializar(categoria: CategoriaEquipo): Promise<void>
   - Carga datos iniciales de la categoría y equipos

2. _cargarDatos(): Promise<void>
   - Carga equipos y estudiantes del curso

3. _organizarEstudiantesPorEquipo(): Promise<void>
   - Organiza estudiantes en sus equipos respectivos
   - Identifica estudiantes sin equipo

4. recargarDatos(): Promise<void>
   - Recarga todos los datos

5. mostrarDialogoAgregarEstudiante(equipo: Equipo): void
   - Muestra diálogo para agregar estudiante a equipo

6. mostrarDialogoMoverEstudiante(estudiante: Usuario, equipoActual: Equipo): void
   - Muestra diálogo para mover estudiante entre equipos

7. _agregarEstudianteAEquipo(estudiante: Usuario, equipo: Equipo): void
   - Agrega estudiante a un equipo (local, no persistido)

8. _moverEstudianteEntreEquipos(estudiante: Usuario, equipoOrigen: Equipo, equipoDestino: Equipo): void
   - Mueve estudiante entre equipos (local, no persistido)

9. eliminarEstudianteDeEquipo(estudiante: Usuario, equipo: Equipo): void
   - Elimina estudiante de un equipo (local, no persistido)

10. eliminarEquipo(equipo: Equipo): void
    - Marca equipo para eliminación

11. guardarCambios(): Promise<void>
    - Persiste todos los cambios acumulados al backend

12. descartarCambios(): void
    - Descarta cambios no guardados

13. _estaEnEquipo(estudianteId: string, equipoId: string): boolean
    - Verifica si estudiante está en equipo específico
```

#### **Estado Variables Necesarias:**
```typescript
categoria: CategoriaEquipo | null;
equipos: Equipo[];
todosLosEstudiantes: Usuario[];
estudiantesSinEquipo: Usuario[];
estudiantesPorEquipo: Map<string, Usuario[]>;
isLoading: boolean;
isGuardando: boolean;
hayChangiosPendientes: boolean;
uiUpdateCounter: number; // Para forzar actualizaciones de UI
totalEstudiantes: number; // getter
```

#### **UseCase Necesario:**
```typescript
// Método faltante en CategoriaEquipoUseCase:
getEstudiantesDelCurso(cursoId: number): Promise<Usuario[]>
```

---

## 4. EvaluacionPeriodoController

### ✅ Métodos Implementados en React Native:
- `cargarEvaluacionesPorActividad(actividadId)`
- `cargarEvaluacionesPorProfesor(profesorId)`
- `cargarEvaluacionesActivas()`
- `cargarEvaluacionPorId(id)`
- `crearEvaluacionPeriodo(params)`
- `activarEvaluacion(id)`
- `finalizarEvaluacion(id)`
- `eliminarEvaluacion(id)`

### ❌ Métodos Faltantes (mínimos):

El controlador está bastante completo. Solo faltan métodos auxiliares de Flutter/GetX que no son necesarios en React Native.

---

## 5. EvaluacionDetalleControllerTemp

### ❌ **COMPLETAMENTE FALTANTE** en React Native

Este controlador NO EXISTE en React Native. Por eso EvaluacionDetalleScreen es un placeholder.

#### **Métodos Necesarios:**
```typescript
1. cargarEstadisticasCompletas(evaluacionPeriodoId: string): Promise<void>
   - Carga todas las evaluaciones individuales
   - Calcula promedios por estudiante
   - Calcula promedios por equipo
   - Calcula estadísticas generales

2. calcularPromedioEstudiante(estudianteId: string): number
   - Promedio de todas las evaluaciones recibidas

3. calcularPromedioEquipo(equipoId: string): number
   - Promedio de todos los estudiantes del equipo

4. getEvaluacionesDeEstudiante(estudianteId: string): EvaluacionIndividual[]
   - Lista de evaluaciones que recibió un estudiante

5. getEvaluacionesDeEquipo(equipoId: string): EvaluacionIndividual[]
   - Lista de evaluaciones de todos los miembros del equipo

6. getProgresoEvaluaciones(): { completadas: number; pendientes: number; total: number }
   - Estadísticas de progreso de evaluaciones
```

#### **Estado Variables Necesarias:**
```typescript
evaluacionesIndividuales: EvaluacionIndividual[];
promediosEstudiantes: Map<string, number>;
promediosEquipos: Map<string, number>;
progresoEvaluaciones: { completadas: number; pendientes: number; total: number };
isLoading: boolean;
```

---

## 6. EvaluacionIndividualController

### ❌ **COMPLETAMENTE FALTANTE** en React Native

Este controlador NO EXISTE en React Native. Por eso RealizarEvaluacionScreen es un placeholder.

#### **Métodos Necesarios:**
```typescript
1. cargarEvaluacionEspecifica(periodoId: string, evaluadorId: string, evaluadoId: string): Promise<void>
   - Carga evaluación existente si ya fue realizada

2. puedeEvaluar(evaluadorId: string, evaluadoId: string, periodoId: string): Promise<boolean>
   - Verifica si el evaluador puede evaluar al evaluado (incluye auto-evaluación)

3. crearEvaluacion(params: {
     evaluacionPeriodoId: string;
     evaluadorId: string;
     evaluadoId: string;
     equipoId: string;
     calificaciones: Map<CriterioEvaluacion, number>;
     comentario?: string;
   }): Promise<void>
   - Crea o actualiza una evaluación individual

4. getEvaluacionesRealizadas(evaluadorId: string, periodoId: string): Promise<EvaluacionIndividual[]>
   - Obtiene todas las evaluaciones que el usuario ha realizado

5. getEvaluacionesRecibidas(evaluadoId: string, periodoId: string): Promise<EvaluacionIndividual[]>
   - Obtiene todas las evaluaciones que el usuario ha recibido
```

#### **Estado Variables Necesarias:**
```typescript
evaluacionActual: EvaluacionIndividual | null;
evaluacionesRealizadas: EvaluacionIndividual[];
isLoading: boolean;
isSaving: boolean;
```

#### **Entity Necesaria:**
```typescript
// CriterioEvaluacion enum faltante:
enum CriterioEvaluacion {
  PUNTUALIDAD = 'puntualidad',
  CONTRIBUCIONES = 'contribuciones',
  COMPROMISO = 'compromiso',
  ACTITUD = 'actitud',
}
```

---

## Resumen de Prioridades

### 🔴 **CRÍTICO** (Bloquea funcionalidad principal):

1. **ActivityController:**
   - `loadEquiposPorCategoria()` - Necesario para ActivityAssignmentScreen
   - `getEquiposConActividad()` - Necesario para ActivityAssignmentScreen
   - `assignActivityToSelectedTeams()` - **BLOQUEANTE** para asignación
   - `toggleEquipoSelection()`, `isEquipoSelected()` - Necesario para UI de selección

2. **EditarEstudiantesCategoriaController:**
   - **TODO EL CONTROLADOR** falta - EditarEstudiantesCategoriaScreen es placeholder
   - `getEstudiantesDelCurso()` en UseCase - **BLOQUEANTE**

3. **EvaluacionDetalleControllerTemp:**
   - **TODO EL CONTROLADOR** falta - EvaluacionDetalleScreen es placeholder
   - `cargarEstadisticasCompletas()` - **BLOQUEANTE**

4. **EvaluacionIndividualController:**
   - **TODO EL CONTROLADOR** falta - RealizarEvaluacionScreen es placeholder
   - `crearEvaluacion()`, `puedeEvaluar()` - **BLOQUEANTES**

### 🟡 **IMPORTANTE** (Mejora experiencia):

1. **CategoriaEquipoController:**
   - `generarEquiposAleatorios()` - Feature mencionada en UI pero no implementada
   - Caché y optimización - Mejora rendimiento

2. **ActivityController:**
   - `selectAllTeams()`, `selectTeamsWithoutActivity()` - Shortcuts útiles
   - `getActividadesAsignadasAEquipo()` - Para vistas de estudiante

### 🟢 **OPCIONAL** (No crítico):

1. Métodos de UI específicos de Flutter (diálogos, snackbars)
2. Métodos de caché y optimización
3. Helpers de validación de permisos (pueden implementarse en los screens)

---

## Implementación Recomendada

### Fase 1: Desbloquear Placeholders (1-2 días)
1. Implementar métodos de asignación en `ActivityController`
2. Crear `EditarEstudiantesCategoriaController` completo
3. Agregar `getEstudiantesDelCurso()` al UseCase

### Fase 2: Evaluaciones Completas (2-3 días)
1. Crear `EvaluacionIndividualController`
2. Crear `EvaluacionDetalleControllerTemp`
3. Implementar pantallas completas

### Fase 3: Features Adicionales (1 día)
1. `generarEquiposAleatorios()` en CategoriaEquipoController
2. Métodos de selección múltiple en ActivityController
3. Optimizaciones de caché

---

## Notas Adicionales

- **GetX vs React Native**: Muchos métodos de Flutter son específicos de GetX (diálogos, snackbars). En React Native estos se manejan con componentes y navegación.

- **Observer Pattern**: React Native usa `subscribe/unsubscribe` mientras Flutter usa `Rx` observables de GetX. La funcionalidad es equivalente.

- **Validación de Permisos**: Flutter tiene helpers `esProfesor`, `esProfesorDelCurso` que podrían agregarse a React Native para consistencia.

- **UseCases Faltantes**: El método `getEstudiantesDelCurso()` debe agregarse al `CategoriaEquipoUseCase` y al repository correspondiente.
