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
import { Activity } from '../../domain/entities/Activity';
import { ActivityController } from '../controllers/ActivityController';

interface Props {
  navigation: any;
  route?: { params?: { categoria?: any } };
}

export const ActivitiesScreen: React.FC<Props> = ({ navigation, route }) => {
  const categoria = route?.params?.categoria;

  const [controller] = useState(() =>
    DependencyInjection.resolve<ActivityController>('ActivityController')
  );

  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = controller.subscribe(() => {
      setActivities([...controller.activities]);
      setIsLoading(controller.isLoading);
    });

    loadActivities();

    return () => unsubscribe();
  }, []);

  const loadActivities = async () => {
    await controller.loadActivities();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadActivities();
    setIsRefreshing(false);
  };

  const handleDeleteActivity = (activity: Activity) => {
    Alert.alert(
      'Eliminar Actividad',
      `¿Estás seguro de que deseas eliminar "${activity.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (activity.id !== undefined) {
              await controller.deleteActivity(
                activity.id,
                () => Alert.alert('Eliminado', 'La actividad ha sido eliminada'),
                (error) => Alert.alert('Error', error)
              );
            }
          },
        },
      ]
    );
  };

  const handleEditActivity = (activity: Activity) => {
    navigation.navigate('ActivityForm', { activity });
  };

  const handleAssignActivity = (activity: Activity) => {
    navigation.navigate('ActivityAssignment', { activity });
  };

  const handleCreateActivity = () => {
    navigation.navigate('ActivityForm', { categoria });
  };

  const calculateDaysRemaining = (deliveryDate: Date): number => {
    const now = new Date();
    const delivery = new Date(deliveryDate);
    const diffTime = delivery.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDaysRemainingText = (daysRemaining: number): string => {
    if (daysRemaining < 0) {
      return `Vencida hace ${-daysRemaining} días`;
    } else if (daysRemaining === 0) {
      return 'Vence hoy';
    } else if (daysRemaining === 1) {
      return 'Vence mañana';
    } else {
      return `Vence en ${daysRemaining} días`;
    }
  };

  const getCardColor = (index: number): string => {
    const colors = ['#6366F1', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];
    return colors[index % colors.length];
  };

  const renderActivityCard = ({ item, index }: { item: Activity; index: number }) => {
    const daysRemaining = calculateDaysRemaining(item.fechaEntrega);
    const cardColor = getCardColor(index);
    const deliveryDate = new Date(item.fechaEntrega);

    return (
      <TouchableOpacity
        style={[styles.activityCard, { backgroundColor: cardColor }]}
        onPress={() => handleAssignActivity(item)}
        activeOpacity={0.9}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>📝</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.activityTitle}>{item.nombre}</Text>
            <Text style={styles.daysRemaining}>
              {getDaysRemainingText(daysRemaining)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              Alert.alert('Opciones', 'Selecciona una acción', [
                { text: 'Editar', onPress: () => handleEditActivity(item) },
                {
                  text: 'Eliminar',
                  onPress: () => handleDeleteActivity(item),
                  style: 'destructive',
                },
                { text: 'Cancelar', style: 'cancel' },
              ])
            }
            style={styles.menuButton}
          >
            <Text style={styles.menuIcon}>⋮</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.activityDescription} numberOfLines={3}>
          {item.descripcion}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateIcon}>📅</Text>
            <Text style={styles.dateText}>
              {deliveryDate.getDate()}/{deliveryDate.getMonth() + 1}/
              {deliveryDate.getFullYear()}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleEditActivity(item)}
            style={styles.arrowContainer}
          >
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>📋</Text>
      </View>
      <Text style={styles.emptyTitle}>No hay actividades</Text>
      <Text style={styles.emptySubtitle}>
        {categoria ? 'No hay actividades para esta categoría' : 'Crea tu primera actividad'}
      </Text>
      <TouchableOpacity onPress={handleCreateActivity} style={styles.emptyButton}>
        <Text style={styles.emptyButtonIcon}>+</Text>
        <Text style={styles.emptyButtonText}>Crear Actividad</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Actividades</Text>
          {categoria && <Text style={styles.headerSubtitle}>{categoria.nombre}</Text>}
        </View>
      </View>

      {/* Content */}
      {isLoading && activities.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <FlatList
          data={activities}
          renderItem={renderActivityCard}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#6366F1']}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}

      {/* FAB */}
      <TouchableOpacity onPress={handleCreateActivity} style={styles.fab}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    marginRight: 12,
  },
  backIcon: {
    fontSize: 24,
    color: '#FFF',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  activityCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  headerTextContainer: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  daysRemaining: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.7,
  },
  menuButton: {
    padding: 4,
  },
  menuIcon: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: 'bold',
  },
  activityDescription: {
    fontSize: 14,
    color: '#FFF',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dateIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '500',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    fontSize: 16,
    color: '#FFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonIcon: {
    fontSize: 20,
    color: '#FFF',
    marginRight: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: '#FFF',
  },
});

