import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import RobleApiDataSource from '../../../../core/data/datasources/RobleApiDataSource';
import { ActivityRepositoryRobleImpl } from '../../../activities/data/repositories/ActivityRepositoryRobleImpl';
import { Activity } from '../../../activities/domain/entities/Activity';
import { ActivityController } from '../../../activities/presentation/controllers/ActivityController';
import { UsuarioRepositoryRobleImpl } from '../../../auth/data/repositories/UsuarioRepositoryRobleImpl';
import { useAuth } from '../../../auth/presentation/context/authContext';
import { CategoriaEquipoRepositoryRobleImpl } from '../../../categories/data/repositories/CategoriaEquipoRepositoryRobleImpl';
import { EquipoActividadRepositoryRobleImpl } from '../../../categories/data/repositories/EquipoActividadRepositoryRobleImpl';
import { EquipoRepositoryRobleImpl } from '../../../categories/data/repositories/EquipoRepositoryRobleImpl';
import { Equipo } from '../../../categories/domain/entities/EquipoEntity';
import { CategoriaEquipoUseCase } from '../../../categories/domain/usecases/CategoriaEquipoUseCase';
import { EquipoActividadUseCase } from '../../../categories/domain/usecases/EquipoActividadUseCase';
import { CategoriaEquipoController } from '../../../categories/presentation/controllers/CategoriaEquipoController';
import CursoDomain from '../../domain/entities/CursoEntity';

interface Props {
  navigation: any;
  route: { params: { curso: CursoDomain } };
}

export const EstudianteCursoDetalleScreen: React.FC<Props> = ({ navigation, route }) => {
  const { curso } = route.params;
  const { controller: authController } = useAuth();

  const [activityController, setActivityController] = useState<ActivityController | null>(null);
  const [categoriaController, setCategoriaController] = useState<CategoriaEquipoController | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const [selectedTab, setSelectedTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [actividades, setActividades] = useState<Activity[]>([]);
  const [todosLosEquipos, setTodosLosEquipos] = useState<Equipo[]>([]);
  const [misEquipos, setMisEquipos] = useState<Equipo[]>([]);

  // Initialize controllers
  useEffect(() => {
    const initializeControllers = async () => {
      try {
        console.log('🔧 Initializing EstudianteCursoDetalleScreen controllers...');

        if (!authController) {
          console.error('❌ AuthController not available');
          return;
        }

        const currentUserId = authController.currentUser?.id;
        if (!currentUserId) {
          console.error('❌ Current user ID not available');
          Alert.alert('Error', 'No se pudo obtener la información del usuario');
          return;
        }

        // Create datasource
        const dataSource = new RobleApiDataSource();

        // Create repositories
        const activityRepository = new ActivityRepositoryRobleImpl(dataSource);
        const categoriaRepository = new CategoriaEquipoRepositoryRobleImpl(dataSource);
        const equipoRepository = new EquipoRepositoryRobleImpl(dataSource);
        const equipoActividadRepository = new EquipoActividadRepositoryRobleImpl(dataSource, equipoRepository);
        const usuarioRepository = new UsuarioRepositoryRobleImpl();

        // Create use cases
        const categoriaUseCase = new CategoriaEquipoUseCase(
          categoriaRepository,
          equipoRepository,
          usuarioRepository
        );
        const equipoActividadUseCase = new EquipoActividadUseCase(equipoActividadRepository);

        // Create controllers
        const activityCtrl = new ActivityController(
          activityRepository,
          categoriaUseCase,
          equipoActividadUseCase
        );

        const categoriaCtrl = new CategoriaEquipoController(
          categoriaRepository,
          equipoRepository,
          currentUserId
        );

        setActivityController(activityCtrl);
        setCategoriaController(categoriaCtrl);

        console.log('✅ Controllers initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing controllers:', error);
        Alert.alert('Error', 'No se pudieron inicializar los controladores');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeControllers();
  }, [authController]);

  useEffect(() => {
    if (!isInitializing && activityController && categoriaController) {
      loadData();
    }
  }, [isInitializing, activityController, categoriaController]);

  const loadData = async () => {
    if (!activityController || !categoriaController) {
      console.warn('⚠️ Controllers not initialized yet');
      return;
    }

    try {
      setIsLoading(true);

      // Cargar todas las actividades (filtrar por curso en el futuro)
      await activityController.loadActivities();
      setActividades(activityController.activities);

      // Cargar equipos
      await categoriaController.loadCategoriasPorCurso(curso);
      const equipos = [...categoriaController.equipos];
      setTodosLosEquipos(equipos);

      // Filtrar mis equipos (simplificado - en producción usar ID del usuario actual)
      setMisEquipos(equipos.slice(0, Math.min(2, equipos.length)));
    } catch (error) {
      console.error('Error loading course details:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del curso');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderActivityCard = ({ item }: { item: Activity }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>📝</Text>
        <Text style={styles.cardTitle}>{item.nombre}</Text>
      </View>
      <Text style={styles.cardDescription}>{item.descripcion}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardMeta}>📅 {formatDate(item.fechaEntrega)}</Text>
      </View>
    </View>
  );

  const renderTeamCard = ({ item }: { item: Equipo }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>👥</Text>
        <Text style={styles.cardTitle}>{item.nombre}</Text>
      </View>
      <Text style={styles.teamCategory}>Categoría: {item.categoriaId || 'Sin categoría'}</Text>
      <View style={styles.teamMembersContainer}>
        <Text style={styles.teamMembersTitle}>Miembros del equipo:</Text>
        {item.estudiantesIds.slice(0, 3).map((id, idx) => (
          <View key={idx} style={styles.memberRow}>
            <Text style={styles.memberIcon}>👤</Text>
            <Text style={styles.memberText}>Estudiante {id}</Text>
          </View>
        ))}
        {item.estudiantesIds.length > 3 && (
          <Text style={styles.moreMembers}>
            +{item.estudiantesIds.length - 3} más...
          </Text>
        )}
      </View>
    </View>
  );

  const renderEmptyState = (icon: string, title: string, subtitle: string) => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#673AB7" />
          <Text style={styles.loadingText}>Cargando datos del curso...</Text>
        </View>
      );
    }

    const refreshControl = (
      <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
    );

    switch (selectedTab) {
      case 0: // Actividades
        return (
          <FlatList
            data={actividades}
            renderItem={renderActivityCard}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={refreshControl}
            ListEmptyComponent={() =>
              renderEmptyState(
                '📋',
                'No hay actividades asignadas',
                'El profesor aún no ha asignado actividades a tus equipos'
              )
            }
          />
        );

      case 1: // Todos los Equipos
        return (
          <FlatList
            data={todosLosEquipos}
            renderItem={renderTeamCard}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={refreshControl}
            ListEmptyComponent={() =>
              renderEmptyState(
                '👥',
                'No hay equipos',
                'Aún no se han creado equipos para este curso'
              )
            }
          />
        );

      case 2: // Mis Equipos
        return (
          <FlatList
            data={misEquipos}
            renderItem={renderTeamCard}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={refreshControl}
            ListEmptyComponent={() =>
              renderEmptyState(
                '🤷',
                'No estás en ningún equipo',
                'Aún no has sido asignado a ningún equipo de este curso'
              )
            }
          />
        );

      case 3: // Evaluaciones
        return (
          <ScrollView
            contentContainerStyle={styles.listContent}
            refreshControl={refreshControl}
          >
            {renderEmptyState(
              '📊',
              'No hay evaluaciones',
              'Cuando haya evaluaciones activas aparecerán aquí'
            )}
          </ScrollView>
        );

      default:
        return null;
    }
  };

  const tabs = [
    { label: 'Actividades', icon: '📝' },
    { label: 'Todos Equipos', icon: '👥' },
    { label: 'Mis Equipos', icon: '✅' },
    { label: 'Evaluaciones', icon: '📊' },
  ];

  return (
    <View style={styles.container}>
      {isInitializing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Inicializando...</Text>
        </View>
      ) : (
        <>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>{curso.nombre}</Text>
              <Text style={styles.headerSubtitle}>Vista de estudiante</Text>
            </View>
            <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
              <Text style={styles.refreshIcon}>🔄</Text>
            </TouchableOpacity>
          </View>

          {/* Tab Bar */}
          <View style={styles.tabBar}>
            {tabs.map((tab, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedTab(index)}
                style={[styles.tab, selectedTab === index && styles.tabActive]}
              >
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                <Text
                  style={[styles.tabLabel, selectedTab === index && styles.tabLabelActive]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          {renderTabContent()}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#673AB7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40,
  },
  backButton: {
    marginRight: 12,
  },
  backIcon: {
    fontSize: 24,
    color: '#FFF',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
  },
  refreshButton: {
    padding: 8,
  },
  refreshIcon: {
    fontSize: 20,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#673AB7',
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#FFF',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 11,
    color: '#FFF',
    opacity: 0.7,
    textAlign: 'center',
  },
  tabLabelActive: {
    opacity: 1,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardMeta: {
    fontSize: 12,
    color: '#999',
  },
  teamCategory: {
    fontSize: 14,
    color: '#673AB7',
    marginBottom: 12,
    fontWeight: '500',
  },
  teamMembersContainer: {
    marginTop: 8,
  },
  teamMembersTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  memberIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  memberText: {
    fontSize: 14,
    color: '#666',
  },
  moreMembers: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 300,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

