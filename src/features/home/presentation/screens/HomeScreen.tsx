import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import RobleApiDataSource from '../../../../core/data/datasources/RobleApiDataSource';
import UsuarioRepositoryRobleImpl from '../../../auth/data/repositories/UsuarioRepositoryRobleImpl';
import { UsuarioUseCase } from '../../../auth/domain/use_case/UsuarioUseCase';
import { useAuth } from '../../../auth/presentation/context/authContext';
import { CursoRepositoryRobleImpl } from '../../data/repositories/CursoRepositoryRobleImpl';
import { InscripcionRepositoryRobleImpl } from '../../data/repositories/InscripcionRepositoryRobleImpl';
import CursoDomain from '../../domain/entities/CursoEntity';
import { CursoUseCase } from '../../domain/usecases/CursoUseCase';
import { HomeController } from '../controllers/HomeController';

/**
 * HomeScreen
 * 
 * Main screen showing enrolled and taught courses.
 * Maintains UI fidelity with Flutter implementation.
 */
export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout: authLogout, controller: authController } = useAuth();

  const [controller, setController] = useState<HomeController | null>(null);
  const [dictados, setDictados] = useState<CursoDomain[]>([]);
  const [inscritos, setInscritos] = useState<CursoDomain[]>([]);
  const [isLoadingDictados, setIsLoadingDictados] = useState(false);
  const [isLoadingInscritos, setIsLoadingInscritos] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0); // 0 = Dictados, 1 = Inscritos

  // Initialize controller
  useEffect(() => {
    console.log('🏠 Initializing HomeController...');
    console.log('🏠 Current user:', user);
    console.log('🏠 Auth controller available:', !!authController);

    if (!user || !authController) {
      console.log('⚠️ No user or authController available, skipping controller initialization');
      return;
    }

    const initController = async () => {
      try {
        // Importar instancia de DI para obtener el datasource
        const di = (await import('../../../../core/di/DependencyInjection')).default;
        const dataSource = di.resolve('RobleApiDataSource') as RobleApiDataSource;

        // Initialize repositories con datasource
        const cursoRepository = new CursoRepositoryRobleImpl(dataSource);
        const inscripcionRepository = new InscripcionRepositoryRobleImpl(dataSource);
        const cursoUseCase = new CursoUseCase(cursoRepository, inscripcionRepository);

        const usuarioRepository = new UsuarioRepositoryRobleImpl(); // No usa datasource en constructor
        const usuarioUseCase = new UsuarioUseCase(usuarioRepository);

        // Create controller with authController from context
        const ctrl = new HomeController(cursoUseCase, authController, usuarioUseCase);
        setController(ctrl);

        console.log('✅ HomeController initialized successfully with authController');

        // Initialize and load data
        await ctrl.init();
      } catch (error) {
        console.error('❌ Error initializing HomeController:', error);
      }
    };

    initController();
  }, [user, authController]);

  // Subscribe to controller changes
  useEffect(() => {
    if (!controller) return;

    const unsubscribe = controller.subscribe(() => {
      console.log('🔄 Controller state updated');
      setDictados([...controller.dictados]);
      setInscritos([...controller.inscritos]);
      setIsLoadingDictados(controller.isLoadingDictados);
      setIsLoadingInscritos(controller.isLoadingInscritos);
      setRefreshing(false);
    });

    // Initial data load
    loadData();

    return unsubscribe;
  }, [controller]);

  const loadData = async () => {
    if (!controller || !user?.id) {
      console.log('⚠️ Cannot load data - controller or user not available');
      return;
    }

    console.log('🔄 Loading courses for user ID:', user.id);
    await controller.refreshData();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const handleCreateCourse = () => {
    navigation.navigate('NewCourse');
  };

  const handleEnrollCourse = () => {
    navigation.navigate('EnrollCourse');
  };

  const handleLogout = async () => {
    console.log('🚪 handleLogout called - Showing confirmation dialog');

    // Use window.confirm for web, Alert.alert for native
    if (Platform.OS === 'web') {
      console.log('🚪 Using window.confirm for web');
      const confirmed = window.confirm('¿Estás seguro de que deseas cerrar sesión?');
      console.log('🚪 User response:', confirmed ? 'CONFIRMED' : 'CANCELLED');

      if (confirmed) {
        console.log('🚪 User confirmed logout - Starting logout process...');
        try {
          await authLogout();
          console.log('🚪 authLogout completed successfully');
        } catch (error) {
          console.error('🚪 Error during logout:', error);
        }
      } else {
        console.log('🚪 Logout cancelled by user');
      }
    } else {
      // Native platforms
      Alert.alert(
        'Cerrar Sesión',
        '¿Estás seguro de que deseas cerrar sesión?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => console.log('🚪 Logout cancelled by user')
          },
          {
            text: 'Salir',
            style: 'destructive',
            onPress: async () => {
              console.log('🚪 User confirmed logout - Starting logout process...');
              try {
                await authLogout();
                console.log('🚪 authLogout completed successfully');
              } catch (error) {
                console.error('🚪 Error during logout:', error);
              }
            },
          },
        ]
      );
    }
  };

  const handleCoursePress = (curso: CursoDomain, isDictado: boolean) => {
    if (isDictado) {
      // Navigate to teacher view (team management)
      navigation.navigate('CategoriasEquipos', { curso });
    } else {
      // Navigate to student view
      navigation.navigate('EstudianteCursoDetalle', { curso });
    }
  };

  const handleManageCourse = (curso: CursoDomain) => {
    // Show options menu for course management
    if (Platform.OS === 'web') {
      // For web, show a simple confirmation
      const action = window.confirm('¿Deseas gestionar los equipos de este curso?');
      if (action) {
        navigation.navigate('CategoriasEquipos', { curso });
      }
    } else {
      // For mobile, show alert with options
      Alert.alert(
        'Gestionar Curso',
        'Selecciona una opción:',
        [
          {
            text: 'Gestionar Equipos',
            onPress: () => navigation.navigate('CategoriasEquipos', { curso }),
          },
          {
            text: 'Editar Curso',
            onPress: () => navigation.navigate('NewCourse', { curso, isEditing: true }),
          },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
    }
  };

  const renderCourseCard = (curso: CursoDomain, isDictado: boolean) => {
    return (
      <TouchableOpacity
        key={curso.id}
        style={styles.courseCard}
        onPress={() => handleCoursePress(curso, isDictado)}
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
          {isDictado && (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={(e) => {
                e.stopPropagation();
                handleManageCourse(curso);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.menuButtonText}>⋮</Text>
            </TouchableOpacity>
          )}
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
            <Text style={styles.avatarText}>
              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View>
            <Text style={styles.greeting}>¡Hola!</Text>
            <Text style={styles.userName}>{user?.email || 'Usuario'}</Text>
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
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              console.log('🚪 Logout button pressed');
              handleLogout();
            }}
          >
            <Text style={styles.logoutIcon}>⎋</Text>
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
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
        {selectedTab === 0 ? (
          // Dictados
          <View style={styles.courseList}>
            {controller?.isLoadingDictados ? (
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
            )}
          </View>
        ) : (
          // Inscritos
          <View style={styles.courseList}>
            {controller?.isLoadingInscritos ? (
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
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        {selectedTab === 0 ? (
          <TouchableOpacity
            style={[
              styles.fab,
              {
                backgroundColor: '#2196F3',
                ...(Platform.OS === 'web' && {
                  boxShadow: '0px 8px 16px rgba(33, 150, 243, 0.4)',
                })
              }
            ]}
            onPress={handleCreateCourse}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 20, marginRight: 8 }}>➕</Text>
            <Text style={styles.fabText}>Crear Curso</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.fab,
              {
                backgroundColor: '#4CAF50',
                ...(Platform.OS === 'web' && {
                  boxShadow: '0px 8px 16px rgba(76, 175, 80, 0.4)',
                })
              }
            ]}
            onPress={handleEnrollCourse}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 20, marginRight: 8 }}>🔍</Text>
            <Text style={styles.fabText}>Buscar Cursos</Text>
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
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5252',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  logoutIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    marginRight: 4,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 150,
    minHeight: '120%',
  },
  welcomeCard: {
    marginBottom: 16,
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
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: 8,
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
    paddingBottom: 20,
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
    elevation: 2,
  },
  courseHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
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
    marginBottom: 12,
  },
  categoryChip: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
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
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#616161',
    lineHeight: 24,
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
    position: Platform.OS === 'web' ? 'fixed' as any : 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 9999,
    elevation: 10,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  fabText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
