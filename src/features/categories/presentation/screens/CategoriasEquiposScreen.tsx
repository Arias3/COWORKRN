import { useNavigation, useRoute } from '@react-navigation/native';
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
import { useAuth } from '../../../auth/presentation/context/authContext';
import CursoDomain from '../../../home/domain/entities/CursoEntity';
import { CategoriaEquipoRepositoryRobleImpl } from '../../data/repositories/CategoriaEquipoRepositoryRobleImpl';
import { EquipoRepositoryRobleImpl } from '../../data/repositories/EquipoRepositoryRobleImpl';
import { CategoriaEquipo } from '../../domain/entities/CategoriaEquipoEntity';
import { Equipo } from '../../domain/entities/EquipoEntity';
import { TipoAsignacion } from '../../domain/entities/TipoAsignacion';
import { CategoriaEquipoController } from '../controllers/CategoriaEquipoController';

interface RouteParams {
  curso: CursoDomain;
}

const CategoriasEquiposScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams;
  const { controller: authController } = useAuth();

  const [controller, setController] = useState<CategoriaEquipoController | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const [categorias, setCategorias] = useState<CategoriaEquipo[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [selectedCategoria, setSelectedCategoria] =
    useState<CategoriaEquipo | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const esProfesor = controller?.esProfesorDelCursoActual ?? false;

  // Initialize controller
  useEffect(() => {
    const initializeController = async () => {
      try {
        console.log('🔧 Initializing CategoriasEquiposScreen controller...');

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
        const categoriaRepository = new CategoriaEquipoRepositoryRobleImpl(dataSource);
        const equipoRepository = new EquipoRepositoryRobleImpl(dataSource);

        // Create controller
        const ctrl = new CategoriaEquipoController(
          categoriaRepository,
          equipoRepository,
          currentUserId
        );

        setController(ctrl);

        console.log('✅ Controller initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing controller:', error);
        Alert.alert('Error', 'No se pudo inicializar el controlador');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeController();
  }, [authController]);

  useEffect(() => {
    if (!isInitializing && controller) {
      loadData();

      const unsubscribe = controller.subscribe(() => {
        setCategorias([...controller.categorias]);
        setEquipos([...controller.equipos]);
        setIsLoading(controller.isLoading);
      });

      return () => unsubscribe();
    }
  }, [isInitializing, controller]);

  const loadData = async () => {
    if (!controller) {
      console.warn('⚠️ Controller not initialized yet');
      return;
    }

    try {
      await controller.loadCategoriasPorCurso(params.curso);
    } catch (e) {
      console.error('Error cargando datos:', e);
    }
  };

  const handleRefresh = async () => {
    if (!controller) return;
    setRefreshing(true);
    await controller.refreshData();
    setRefreshing(false);
  };

  const handleCategoriaPress = (categoria: CategoriaEquipo) => {
    // TODO: Navegar a pantalla de actividades
    Alert.alert('Categoría', `Seleccionaste: ${categoria.nombre}`);
    // navigation.navigate('ActivitiesScreen', { categoria });
  };

  const handleSelectCategoria = async (categoria: CategoriaEquipo) => {
    if (!controller) return;
    setSelectedCategoria(categoria);
    controller.selectCategoria(categoria);
    await controller.loadEquiposPorCategoria(categoria.id!);
  };

  const handleCreateCategoria = () => {
    if (!controller) return;
    Alert.prompt(
      'Nueva Categoría',
      'Ingrese el nombre de la categoría',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Crear',
          onPress: async (nombre?: string) => {
            if (nombre && nombre.trim().length > 0) {
              await controller.createCategoria(
                nombre.trim(),
                '',
                () => {
                  Alert.alert('Éxito', 'Categoría creada correctamente');
                },
                (error: string) => {
                  Alert.alert('Error', error);
                }
              );
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleDeleteCategoria = (categoria: CategoriaEquipo) => {
    if (!controller) return;
    Alert.alert(
      'Eliminar Categoría',
      `¿Estás seguro de que deseas eliminar "${categoria.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (!controller) return;
            if (categoria.id) {
              await controller.deleteCategoria(
                categoria.id,
                () => {
                  Alert.alert('Eliminada', 'Categoría eliminada correctamente');
                },
                (error: string) => {
                  Alert.alert('Error', error);
                }
              );
            }
          },
        },
      ]
    );
  };

  const handleCreateEquipo = () => {
    if (!controller) return;
    if (!selectedCategoria) {
      Alert.alert('Error', 'Selecciona una categoría primero');
      return;
    }

    Alert.prompt(
      'Nuevo Equipo',
      'Ingrese el nombre del equipo',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Crear',
          onPress: async (nombre?: string) => {
            if (!controller) return;
            if (nombre && nombre.trim().length > 0) {
              await controller.createEquipo(
                nombre.trim(),
                () => {
                  Alert.alert('Éxito', 'Equipo creado correctamente');
                },
                (error: string) => {
                  Alert.alert('Error', error);
                }
              );
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleDeleteEquipo = (equipo: Equipo) => {
    if (!controller) return;
    Alert.alert(
      'Eliminar Equipo',
      `¿Estás seguro de que deseas eliminar "${equipo.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (!controller) return;
            if (equipo.id) {
              await controller.deleteEquipo(
                equipo.id,
                () => {
                  Alert.alert('Eliminado', 'Equipo eliminado correctamente');
                },
                (error: string) => {
                  Alert.alert('Error', error);
                }
              );
            }
          },
        },
      ]
    );
  };

  const renderCategoriaCard = ({ item }: { item: CategoriaEquipo }) => {
    const isManual = item.tipoAsignacion === TipoAsignacion.MANUAL;
    const color = isManual ? '#10B981' : '#F59E0B';
    const icon = isManual ? '👥' : '🔀';

    return (
      <TouchableOpacity
        style={styles.categoriaCard}
        onPress={() => handleCategoriaPress(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardIcon}>{icon}</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{item.nombre}</Text>
              <Text style={[styles.cardSubtitle, { color }]}>
                {item.tipoAsignacion.toUpperCase()} - {item.equiposIds.length}{' '}
                equipos
              </Text>
            </View>
          </View>
          {esProfesor && (
            <TouchableOpacity
              onPress={() =>
                Alert.alert('Opciones', `Categoría: ${item.nombre}`, [
                  {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => handleDeleteCategoria(item),
                  },
                  { text: 'Cancelar', style: 'cancel' },
                ])
              }
            >
              <Text style={styles.menuIcon}>⋮</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.cardInfo}>
          Máximo {item.maxEstudiantesPorEquipo} estudiantes por equipo
        </Text>
        {!isManual && esProfesor && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: color }]}
            onPress={() => {
              if (!controller) return;
              controller.selectCategoria(item);
              Alert.alert(
                'Próximamente',
                'La generación aleatoria de equipos se implementará próximamente'
              );
            }}
          >
            <Text style={styles.buttonIcon}>🔀</Text>
            <Text style={styles.buttonText}>Generar Equipos</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderEquipoCard = ({ item }: { item: Equipo }) => {
    return (
      <TouchableOpacity
        style={styles.equipoCard}
        onPress={() => {
          // TODO: Navegar a editar estudiantes
          Alert.alert('Equipo', `Seleccionaste: ${item.nombre}`);
          // navigation.navigate('EditarEstudiantesCategoriaScreen', {
          //   equipo: item,
          //   categoria: selectedCategoria,
          // });
        }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardIcon}>👥</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{item.nombre}</Text>
              <Text style={styles.cardSubtitle}>
                {item.estudiantesIds.length} integrantes
              </Text>
            </View>
          </View>
          {esProfesor && (
            <TouchableOpacity
              onPress={() =>
                Alert.alert('Opciones', `Equipo: ${item.nombre}`, [
                  {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => handleDeleteEquipo(item),
                  },
                  { text: 'Cancelar', style: 'cancel' },
                ])
              }
            >
              <Text style={styles.menuIcon}>⋮</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoriasTab = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      );
    }

    if (categorias.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={styles.emptyTitle}>No hay categorías</Text>
          <Text style={styles.emptySubtitle}>
            Crea categorías para organizar equipos
          </Text>
          {esProfesor && (
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleCreateCategoria}
            >
              <Text style={styles.emptyButtonText}>Crear Categoría</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <FlatList
        data={categorias}
        keyExtractor={(item) => (item.id || 0).toString()}
        renderItem={renderCategoriaCard}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    );
  };

  const renderEquiposTab = () => {
    return (
      <View style={styles.tabContainer}>
        {/* Category Selector */}
        <ScrollView
          horizontal
          style={styles.categorySelector}
          showsHorizontalScrollIndicator={false}
        >
          {categorias.map((categoria) => (
            <TouchableOpacity
              key={categoria.id}
              style={[
                styles.categoryChip,
                selectedCategoria?.id === categoria.id &&
                styles.categoryChipSelected,
              ]}
              onPress={() => handleSelectCategoria(categoria)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategoria?.id === categoria.id &&
                  styles.categoryChipTextSelected,
                ]}
              >
                {categoria.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {!selectedCategoria ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👆</Text>
            <Text style={styles.emptyTitle}>Selecciona una categoría</Text>
          </View>
        ) : equipos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No hay equipos</Text>
            <Text style={styles.emptySubtitle}>
              Crea equipos en esta categoría
            </Text>
            {esProfesor && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={handleCreateEquipo}
              >
                <Text style={styles.emptyButtonText}>Crear Equipo</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={equipos}
            keyExtractor={(item) => (item.id || 0).toString()}
            renderItem={renderEquipoCard}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          />
        )}
      </View>
    );
  };

  const renderEvaluacionesTab = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyTitle}>Evaluaciones</Text>
        <Text style={styles.emptySubtitle}>
          Las evaluaciones se gestionan desde las actividades
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isInitializing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#673AB7" />
          <Text style={styles.loadingText}>Inicializando...</Text>
        </View>
      ) : (
        <>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Gestión del Curso</Text>
              <Text style={styles.headerSubtitle}>{params.curso.nombre}</Text>
            </View>
            <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
              <Text style={styles.refreshIcon}>🔄</Text>
            </TouchableOpacity>
          </View>

          {esProfesor ? (
            <>
              {/* Tab Bar */}
              <View style={styles.tabBar}>
                <TouchableOpacity
                  style={[styles.tab, selectedTab === 0 && styles.tabActive]}
                  onPress={() => setSelectedTab(0)}
                >
                  <Text style={styles.tabIcon}>📂</Text>
                  <Text
                    style={[
                      styles.tabText,
                      selectedTab === 0 && styles.tabTextActive,
                    ]}
                  >
                    Categorías
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, selectedTab === 1 && styles.tabActive]}
                  onPress={() => setSelectedTab(1)}
                >
                  <Text style={styles.tabIcon}>👥</Text>
                  <Text
                    style={[
                      styles.tabText,
                      selectedTab === 1 && styles.tabTextActive,
                    ]}
                  >
                    Equipos
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, selectedTab === 2 && styles.tabActive]}
                  onPress={() => setSelectedTab(2)}
                >
                  <Text style={styles.tabIcon}>📊</Text>
                  <Text
                    style={[
                      styles.tabText,
                      selectedTab === 2 && styles.tabTextActive,
                    ]}
                  >
                    Evaluaciones
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Tab Content */}
              {selectedTab === 0 && renderCategoriasTab()}
              {selectedTab === 1 && renderEquiposTab()}
              {selectedTab === 2 && renderEvaluacionesTab()}

              {/* FAB */}
              {selectedTab === 0 && esProfesor && (
                <TouchableOpacity style={styles.fab} onPress={handleCreateCategoria}>
                  <Text style={styles.fabIcon}>➕</Text>
                </TouchableOpacity>
              )}
              {selectedTab === 1 && esProfesor && selectedCategoria && (
                <TouchableOpacity style={styles.fab} onPress={handleCreateEquipo}>
                  <Text style={styles.fabIcon}>➕</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            // Vista estudiante
            renderCategoriasTab()
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#6366F1',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIcon: {
    fontSize: 20,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#6366F1',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#6366F1',
    fontWeight: 'bold',
  },
  tabContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  categoriaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  equipoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  menuIcon: {
    fontSize: 24,
    color: '#6B7280',
  },
  cardInfo: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  categorySelector: {
    maxHeight: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 4,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 24,
  },
});

export default CategoriasEquiposScreen;
