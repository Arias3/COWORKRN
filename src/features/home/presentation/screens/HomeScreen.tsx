import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CursoDomain from '../../domain/entities/CursoEntity';
import { HomeController } from '../controllers/HomeController';

/**
 * HomeScreen
 * 
 * Main screen showing enrolled and taught courses.
 * Maintains UI fidelity with Flutter implementation.
 */
export const HomeScreen: React.FC = () => {
  const [controller] = useState(() => {
    // Initialize controller (would come from DI in production)
    // For now, this is a placeholder
    return null as any as HomeController;
  });

  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0); // 0 = Dictados, 1 = Inscritos

  useEffect(() => {
    if (controller) {
      controller.init();
      const unsubscribe = controller.subscribe(() => {
        // Force re-render when controller state changes
        setRefreshing(false);
      });
      return unsubscribe;
    }
  }, [controller]);

  const onRefresh = async () => {
    setRefreshing(true);
    // await controller.refreshData();
  };

  const handleCreateCourse = () => {
    // Navigate to new course screen
    Alert.alert('Crear Curso', 'Navegar a pantalla de nuevo curso');
  };

  const handleEnrollCourse = () => {
    // Navigate to enroll course screen
    Alert.alert('Inscribirse', 'Navegar a pantalla de inscripción');
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: () => {
            // Perform logout
          },
        },
      ]
    );
  };

  const renderCourseCard = (curso: CursoDomain, isDictado: boolean) => {
    return (
      <TouchableOpacity
        key={curso.id}
        style={styles.courseCard}
        onPress={() => Alert.alert('Curso', `Seleccionaste: ${curso.nombre}`)}
      >
        <View style={styles.courseHeader}>
          <View style={styles.courseIcon}>
            <Text style={styles.courseIconText}>
              {curso.nombre.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.courseInfo}>
            <Text style={styles.courseName} numberOfLines={2}>
              {curso.nombre}
            </Text>
            <Text style={styles.courseCode}>{curso.codigoRegistro}</Text>
          </View>
        </View>

        {curso.descripcion && (
          <Text style={styles.courseDescription} numberOfLines={2}>
            {curso.descripcion}
          </Text>
        )}

        {curso.categorias && curso.categorias.length > 0 && (
          <View style={styles.categoriesContainer}>
            {curso.categorias.slice(0, 3).map((cat, idx) => (
              <View key={idx} style={styles.categoryChip}>
                <Text style={styles.categoryText}>{cat}</Text>
              </View>
            ))}
            {curso.categorias.length > 3 && (
              <Text style={styles.moreCategoriesText}>
                +{curso.categorias.length - 3} más
              </Text>
            )}
          </View>
        )}

        <View style={styles.courseFooter}>
          <View style={styles.studentsInfo}>
            <Text style={styles.studentsCount}>
              {curso.estudiantesNombres?.length || 0} estudiantes
            </Text>
          </View>
          {isDictado && (
            <TouchableOpacity style={styles.manageButton}>
              <Text style={styles.manageButtonText}>Gestionar</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>U</Text>
          </View>
          <View>
            <Text style={styles.greeting}>¡Hola!</Text>
            <Text style={styles.userName}>Usuario</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Text>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={onRefresh}>
            {refreshing ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Text>🔄</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
            <Text>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeTitle}>Tu Panel de Cursos</Text>
            <Text style={styles.welcomeSubtitle}>
              Gestiona tus cursos dictados e inscritos de manera fácil y eficiente
            </Text>
          </View>
          <View style={styles.welcomeIcon}>
            <Text style={styles.welcomeIconText}>🎓</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {controller?.dictados?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Dictados</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {controller?.inscritos?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Inscritos</Text>
          </View>
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 0 && styles.tabActive]}
            onPress={() => setSelectedTab(0)}
          >
            <Text style={[styles.tabText, selectedTab === 0 && styles.tabTextActive]}>
              Cursos Dictados
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 1 && styles.tabActive]}
            onPress={() => setSelectedTab(1)}
          >
            <Text style={[styles.tabText, selectedTab === 1 && styles.tabTextActive]}>
              Cursos Inscritos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Course List */}
        <View style={styles.courseList}>
          {selectedTab === 0 ? (
            // Dictados
            controller?.isLoadingDictados ? (
              <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
            ) : controller?.dictados && controller.dictados.length > 0 ? (
              controller.dictados.map((curso) => renderCourseCard(curso, true))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📚</Text>
                <Text style={styles.emptyStateTitle}>No hay cursos dictados</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Crea tu primer curso para comenzar
                </Text>
              </View>
            )
          ) : (
            // Inscritos
            controller?.isLoadingInscritos ? (
              <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
            ) : controller?.inscritos && controller.inscritos.length > 0 ? (
              controller.inscritos.map((curso) => renderCourseCard(curso, false))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>🔍</Text>
                <Text style={styles.emptyStateTitle}>No estás inscrito en ningún curso</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Inscríbete en un curso para comenzar
                </Text>
              </View>
            )
          )}
        </View>
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        {selectedTab === 0 ? (
          <TouchableOpacity style={styles.fab} onPress={handleCreateCourse}>
            <Text style={styles.fabText}>➕ Crear Curso</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.fab} onPress={handleEnrollCourse}>
            <Text style={styles.fabText}>📝 Inscribirse</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  greeting: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  welcomeCard: {
    margin: 16,
    padding: 24,
    backgroundColor: '#2196F3',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  welcomeIcon: {
    width: 64,
    height: 64,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeIconText: {
    fontSize: 32,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 15,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: '#2196F3',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  courseList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  courseHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  courseIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  courseIconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  courseCode: {
    fontSize: 14,
    color: '#757575',
  },
  courseDescription: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  categoryChip: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#2196F3',
  },
  moreCategoriesText: {
    fontSize: 12,
    color: '#757575',
    alignSelf: 'center',
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  studentsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentsCount: {
    fontSize: 14,
    color: '#757575',
  },
  manageButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  loader: {
    marginTop: 40,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  fab: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default HomeScreen;
