import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DependencyInjection from '../../../../core/di/DependencyInjection';
import Activity from '../../../activities/domain/entities/Activity';
import { EstadoEvaluacionPeriodo, EvaluacionPeriodo } from '../../domain/entities/EvaluacionPeriodo';
import { EvaluacionPeriodoController } from '../controllers/EvaluacionPeriodoController';

interface RouteParams {
  activity: Activity;
}

const EvaluacionesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams;
  const { activity } = params;

  const [controller] = useState<EvaluacionPeriodoController>(() =>
    DependencyInjection.resolve<EvaluacionPeriodoController>(
      'EvaluacionPeriodoController'
    )
  );

  const [evaluaciones, setEvaluaciones] = useState<EvaluacionPeriodo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modoSeleccion, setModoSeleccion] = useState(false);
  const [evaluacionesSeleccionadas, setEvaluacionesSeleccionadas] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    loadEvaluaciones();

    const unsubscribe = controller.subscribe(() => {
      const evaluacionesMap = controller.evaluacionesPorActividad;
      const evaluacionesList = evaluacionesMap.get(activity.id!.toString()) || [];
      setEvaluaciones(evaluacionesList);
      setIsLoading(controller.isLoading);
    });

    return () => unsubscribe();
  }, []);

  const loadEvaluaciones = async () => {
    try {
      await controller.cargarEvaluacionesPorActividad(activity.id!.toString());
    } catch (e) {
      console.error('Error cargando evaluaciones:', e);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEvaluaciones();
    setRefreshing(false);
  };

  const handleCreateEvaluacion = () => {
    // TODO: Navigate to CrearEvaluacionScreen
    Alert.alert('Crear Evaluación', 'Próximamente');
    // navigation.navigate('CrearEvaluacionScreen', { activity });
  };

  const handleEvaluacionPress = (evaluacion: EvaluacionPeriodo) => {
    if (modoSeleccion) {
      toggleSeleccion(evaluacion.id);
    } else {
      // TODO: Navigate to EvaluacionDetalleScreen
      Alert.alert('Detalle', `Evaluación: ${evaluacion.titulo}`);
      // navigation.navigate('EvaluacionDetalleScreen', { evaluacion, activity });
    }
  };

  const handleLongPress = (evaluacion: EvaluacionPeriodo) => {
    if (!modoSeleccion) {
      setModoSeleccion(true);
      setEvaluacionesSeleccionadas(new Set([evaluacion.id]));
    }
  };

  const toggleSeleccion = (evaluacionId: string) => {
    const newSeleccion = new Set(evaluacionesSeleccionadas);
    if (newSeleccion.has(evaluacionId)) {
      newSeleccion.delete(evaluacionId);
      if (newSeleccion.size === 0) {
        setModoSeleccion(false);
      }
    } else {
      newSeleccion.add(evaluacionId);
    }
    setEvaluacionesSeleccionadas(newSeleccion);
  };

  const seleccionarTodas = () => {
    const todasIds = new Set(evaluaciones.map(e => e.id));
    setEvaluacionesSeleccionadas(todasIds);
  };

  const cancelarSeleccion = () => {
    setModoSeleccion(false);
    setEvaluacionesSeleccionadas(new Set());
  };

  const confirmarEliminarSeleccionadas = () => {
    Alert.alert(
      'Eliminar Evaluaciones',
      `¿Estás seguro de que deseas eliminar ${evaluacionesSeleccionadas.size} evaluación(es)?\n\n⚠️ Esta acción eliminará permanentemente:\n• Las evaluaciones seleccionadas y su configuración\n• Todas las evaluaciones individuales asociadas\n• Los resultados y estadísticas\n\nEsta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: eliminarEvaluacionesSeleccionadas,
        },
      ]
    );
  };

  const eliminarEvaluacionesSeleccionadas = async () => {
    for (const evaluacionId of Array.from(evaluacionesSeleccionadas)) {
      try {
        await controller.eliminarEvaluacion(evaluacionId);
      } catch (e) {
        console.error('Error eliminando evaluación:', e);
      }
    }

    setModoSeleccion(false);
    setEvaluacionesSeleccionadas(new Set());
    await loadEvaluaciones();
    Alert.alert('Éxito', 'Evaluaciones eliminadas correctamente');
  };

  const iniciarEvaluacion = (evaluacion: EvaluacionPeriodo) => {
    Alert.alert(
      'Iniciar Evaluación',
      '¿Estás seguro de que deseas iniciar esta evaluación? Los estudiantes podrán comenzar a evaluarse inmediatamente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Iniciar',
          onPress: async () => {
            await controller.activarEvaluacion(evaluacion.id);
            await loadEvaluaciones();
          },
        },
      ]
    );
  };

  const finalizarEvaluacion = (evaluacion: EvaluacionPeriodo) => {
    Alert.alert(
      'Finalizar Evaluación',
      '¿Estás seguro de que deseas finalizar esta evaluación? Los estudiantes ya no podrán evaluar y se cerrarán todas las evaluaciones pendientes.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          style: 'destructive',
          onPress: async () => {
            await controller.finalizarEvaluacion(evaluacion.id);
            await loadEvaluaciones();
          },
        },
      ]
    );
  };

  const getStatusColor = (estado: EstadoEvaluacionPeriodo): string => {
    switch (estado) {
      case EstadoEvaluacionPeriodo.PENDIENTE:
        return '#F59E0B';
      case EstadoEvaluacionPeriodo.ACTIVO:
        return '#10B981';
      case EstadoEvaluacionPeriodo.FINALIZADO:
        return '#6B7280';
    }
  };

  const getStatusIcon = (estado: EstadoEvaluacionPeriodo): string => {
    switch (estado) {
      case EstadoEvaluacionPeriodo.PENDIENTE:
        return '⏸️';
      case EstadoEvaluacionPeriodo.ACTIVO:
        return '▶️';
      case EstadoEvaluacionPeriodo.FINALIZADO:
        return '✅';
    }
  };

  const getStatusText = (estado: EstadoEvaluacionPeriodo): string => {
    switch (estado) {
      case EstadoEvaluacionPeriodo.PENDIENTE:
        return 'Pendiente';
      case EstadoEvaluacionPeriodo.ACTIVO:
        return 'Activa';
      case EstadoEvaluacionPeriodo.FINALIZADO:
        return 'Finalizada';
    }
  };

  const formatDate = (date: Date): string => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyCard}>
        <View style={styles.emptyIconContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
        </View>
        <Text style={styles.emptyTitle}>No hay evaluaciones creadas</Text>
        <Text style={styles.emptyText}>
          Crea la primera evaluación para que los estudiantes puedan evaluarse entre compañeros de equipo
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={handleCreateEvaluacion}
        >
          <Text style={styles.emptyButtonText}>➕ Crear Evaluación</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEvaluacionCard = ({ item }: { item: EvaluacionPeriodo }) => {
    const isSelected = evaluacionesSeleccionadas.has(item.id);
    const statusColor = getStatusColor(item.estado);
    const statusIcon = getStatusIcon(item.estado);
    const statusText = getStatusText(item.estado);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isSelected && styles.cardSelected,
        ]}
        onPress={() => handleEvaluacionPress(item)}
        onLongPress={() => handleLongPress(item)}
      >
        <View style={styles.cardContent}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>{item.titulo}</Text>
            </View>
            <View style={styles.cardHeaderRight}>
              {modoSeleccion && (
                <View style={styles.checkbox}>
                  {isSelected && <View style={styles.checkboxChecked} />}
                </View>
              )}
              <View style={[styles.statusBadge, { borderColor: statusColor }]}>
                <Text style={styles.statusIcon}>{statusIcon}</Text>
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {statusText}
                </Text>
              </View>
            </View>
          </View>

          {/* Descripción */}
          {item.descripcion && (
            <Text style={styles.cardDescription}>{item.descripcion}</Text>
          )}

          {/* Fechas */}
          <View style={styles.cardDates}>
            <View style={styles.dateRow}>
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.dateText}>
                Creado: {formatDate(item.fechaCreacion)}
              </Text>
            </View>
            {item.fechaFin && (
              <View style={styles.dateRow}>
                <Text style={styles.dateIcon}>⏰</Text>
                <Text style={styles.dateText}>
                  Finaliza: {formatDate(item.fechaFin)}
                </Text>
              </View>
            )}
          </View>

          {/* Acciones */}
          {!modoSeleccion && (
            <View style={styles.cardActions}>
              {item.estado === EstadoEvaluacionPeriodo.PENDIENTE && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.startButton]}
                  onPress={() => iniciarEvaluacion(item)}
                >
                  <Text style={styles.actionButtonIcon}>▶️</Text>
                  <Text style={[styles.actionButtonText, styles.startButtonText]}>
                    Iniciar
                  </Text>
                </TouchableOpacity>
              )}
              {item.estado === EstadoEvaluacionPeriodo.ACTIVO && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.stopButton]}
                  onPress={() => finalizarEvaluacion(item)}
                >
                  <Text style={styles.actionButtonIcon}>⏹️</Text>
                  <Text style={[styles.actionButtonText, styles.stopButtonText]}>
                    Finalizar
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionButton, styles.detailButton]}
                onPress={() => handleEvaluacionPress(item)}
              >
                <Text style={styles.actionButtonIcon}>👁️</Text>
                <Text style={[styles.actionButtonText, styles.detailButtonText]}>
                  Ver Detalle
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (modoSeleccion) {
              cancelarSeleccion();
            } else {
              navigation.goBack();
            }
          }}
        >
          <Text style={styles.backIcon}>{modoSeleccion ? '✕' : '←'}</Text>
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            {modoSeleccion
              ? `${evaluacionesSeleccionadas.size} seleccionadas`
              : 'Evaluaciones'}
          </Text>
          <Text style={styles.headerSubtitle}>{activity.nombre}</Text>
        </View>
        {!modoSeleccion && (
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => setModoSeleccion(true)}
          >
            <Text style={styles.headerIcon}>☑️</Text>
          </TouchableOpacity>
        )}
        {modoSeleccion && (
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={seleccionarTodas}
          >
            <Text style={styles.headerLinkText}>Todas</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lista */}
      {isLoading && evaluaciones.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9333EA" />
        </View>
      ) : evaluaciones.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={evaluaciones}
          renderItem={renderEvaluacionCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#9333EA"
            />
          }
        />
      )}

      {/* FAB - Crear / Eliminar */}
      {modoSeleccion && evaluacionesSeleccionadas.size > 0 ? (
        <TouchableOpacity
          style={[styles.fab, styles.fabDelete]}
          onPress={confirmarEliminarSeleccionadas}
        >
          <Text style={styles.fabIcon}>🗑️</Text>
          <Text style={styles.fabText}>Eliminar ({evaluacionesSeleccionadas.size})</Text>
        </TouchableOpacity>
      ) : !modoSeleccion ? (
        <TouchableOpacity style={styles.fab} onPress={handleCreateEvaluacion}>
          <Text style={styles.fabIcon}>➕</Text>
          <Text style={styles.fabText}>Nueva Evaluación</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#9333EA',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  headerIconButton: {
    padding: 8,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerLinkText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#9333EA',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardSelected: {
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#EF4444',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#EF4444',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  cardDates: {
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  startButton: {
    backgroundColor: '#D1FAE5',
  },
  stopButton: {
    backgroundColor: '#FEE2E2',
  },
  detailButton: {
    backgroundColor: '#EDE9FE',
  },
  actionButtonIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  startButtonText: {
    color: '#047857',
  },
  stopButtonText: {
    color: '#B91C1C',
  },
  detailButtonText: {
    color: '#7C3AED',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9333EA',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  fabDelete: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    left: 24,
    right: undefined,
  },
  fabIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default EvaluacionesScreen;
