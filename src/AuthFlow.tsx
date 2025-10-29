import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

// Auth imports
import { useAuth } from "./features/auth/presentation/context/authContext";
import { LoginPage, RegisterPage } from "./features/auth/presentation/pages";

// Home imports
import { EnrollCourseScreen } from "./features/home/presentation/screens/EnrollCourseScreen";
import { EstudianteCursoDetalleScreen } from "./features/home/presentation/screens/EstudianteCursoDetalleScreen";
import HomeScreen from "./features/home/presentation/screens/HomeScreen";
import { NewCourseScreen } from "./features/home/presentation/screens/NewCourseScreen";

// Categories imports
import CategoriasEquiposScreen from "./features/categories/presentation/screens/CategoriasEquiposScreen";
import EditarEstudiantesCategoriaScreen from "./features/categories/presentation/screens/EditarEstudiantesCategoriaScreen";

// Activities imports
import { ActivitiesScreen } from "./features/activities/presentation/screens/ActivitiesScreen";
import ActivityAssignmentScreen from "./features/activities/presentation/screens/ActivityAssignmentScreen";
import ActivityFormScreen from "./features/activities/presentation/screens/ActivityFormScreen";

// Evaluations imports
import CrearEvaluacionScreen from "./features/evaluations/presentation/screens/CrearEvaluacionScreen";
import EvaluacionDetalleScreen from "./features/evaluations/presentation/screens/EvaluacionDetalleScreen";
import EvaluacionesScreen from "./features/evaluations/presentation/screens/EvaluacionesScreen";
import RealizarEvaluacionScreen from "./features/evaluations/presentation/screens/RealizarEvaluacionScreen";

const Stack = createStackNavigator();

export default function AuthFlow() {
  const { isLoggedIn } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <>
          {/* Main App Screens */}
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />

          {/* Course Management */}
          <Stack.Screen
            name="NewCourse"
            component={NewCourseScreen}
            options={{
              title: "Nuevo Curso",
              headerShown: true,
              presentation: 'modal'
            }}
          />
          <Stack.Screen
            name="EnrollCourse"
            component={EnrollCourseScreen}
            options={{
              title: "Inscribirse a Curso",
              headerShown: true,
              presentation: 'modal'
            }}
          />
          <Stack.Screen
            name="EstudianteCursoDetalle"
            component={EstudianteCursoDetalleScreen as any}
            options={{
              title: "Detalle del Curso",
              headerShown: true
            }}
          />

          {/* Categories & Teams */}
          <Stack.Screen
            name="CategoriasEquipos"
            component={CategoriasEquiposScreen}
            options={{
              title: "Categorías y Equipos",
              headerShown: true
            }}
          />
          <Stack.Screen
            name="EditarEstudiantesCategoria"
            component={EditarEstudiantesCategoriaScreen}
            options={{
              title: "Editar Estudiantes",
              headerShown: true
            }}
          />

          {/* Activities */}
          <Stack.Screen
            name="Activities"
            component={ActivitiesScreen as any}
            options={{
              title: "Actividades",
              headerShown: true
            }}
          />
          <Stack.Screen
            name="AddActivity"
            component={ActivityFormScreen}
            options={{
              title: "Nueva Actividad",
              headerShown: true,
              presentation: 'modal'
            }}
          />
          <Stack.Screen
            name="EditActivity"
            component={ActivityFormScreen}
            options={{
              title: "Editar Actividad",
              headerShown: true,
              presentation: 'modal'
            }}
          />
          <Stack.Screen
            name="AssignActivity"
            component={ActivityAssignmentScreen}
            options={{
              title: "Asignar Actividad",
              headerShown: true
            }}
          />

          {/* Evaluations */}
          <Stack.Screen
            name="Evaluaciones"
            component={EvaluacionesScreen}
            options={{
              title: "Evaluaciones",
              headerShown: true
            }}
          />
          <Stack.Screen
            name="CrearEvaluacion"
            component={CrearEvaluacionScreen}
            options={{
              title: "Crear Evaluación",
              headerShown: true,
              presentation: 'modal'
            }}
          />
          <Stack.Screen
            name="RealizarEvaluacion"
            component={RealizarEvaluacionScreen}
            options={{
              title: "Realizar Evaluación",
              headerShown: true
            }}
          />
          <Stack.Screen
            name="EvaluacionDetalle"
            component={EvaluacionDetalleScreen}
            options={{
              title: "Detalle de Evaluación",
              headerShown: true
            }}
          />
        </>
      ) : (
        <>
          {/* Auth Screens */}
          <Stack.Screen name="Login" component={LoginPage} />
          <Stack.Screen name="Register" component={RegisterPage} />
        </>
      )}
    </Stack.Navigator>
  );
}