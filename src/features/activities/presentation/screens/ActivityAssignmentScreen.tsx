import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Activity } from '../../domain/entities/Activity';

interface RouteParams {
  activity: Activity;
}

const ActivityAssignmentScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams;

  const [selectedEquipos, setSelectedEquipos] = useState<Set<number>>(
    new Set()
  );

  const formatDate = (date: Date): string => {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const handleAssign = () => {
    if (selectedEquipos.size === 0) {
      Alert.alert('Sin selección', 'Selecciona al menos un equipo');
      return;
    }

    Alert.alert(
      'Asignar Actividad',
      `¿Deseas asignar esta actividad a ${selectedEquipos.size} equipo${selectedEquipos.size !== 1 ? 's' : ''
      }?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Asignar',
          onPress: () => {
            Alert.alert('Éxito', 'Actividad asignada correctamente', [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Asignar Actividad</Text>
          <Text style={styles.headerSubtitle}>{params.activity.nombre}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Activity Info Card */}
          <View style={styles.activityCard}>
            <View style={styles.activityRow}>
              <Text style={styles.activityIcon}>📋</Text>
              <View style={styles.activityTextContainer}>
                <Text style={styles.activityName}>
                  {params.activity.nombre}
                </Text>
                <Text style={styles.activityDesc}>
                  {params.activity.descripcion}
                </Text>
                <Text style={styles.activityDate}>
                  Fecha de entrega:{' '}
                  {formatDate(params.activity.fechaEntrega)}
                </Text>
              </View>
            </View>

            <View style={styles.activityHint}>
              <Text style={styles.hintIcon}>ℹ️</Text>
              <Text style={styles.hintText}>
                Asigna equipos para activar el acceso directo a evaluaciones
              </Text>
            </View>
          </View>

          {/* Coming Soon Message */}
          <View style={styles.comingSoonCard}>
            <Text style={styles.comingSoonIcon}>🚧</Text>
            <Text style={styles.comingSoonTitle}>
              Funcionalidad de Asignación
            </Text>
            <Text style={styles.comingSoonDesc}>
              La lista de equipos y la funcionalidad de asignación se
              implementará cuando el módulo de categorías esté completo.
            </Text>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>
                  Listar equipos de la categoría
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>
                  Seleccionar múltiples equipos
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>
                  Asignar actividad a equipos seleccionados
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>
                  Ver equipos con actividad asignada
                </Text>
              </View>
            </View>
          </View>

          {/* Placeholder Button */}
          <TouchableOpacity
            style={styles.placeholderButton}
            onPress={() =>
              Alert.alert(
                'Próximamente',
                'Esta funcionalidad estará disponible cuando se complete el módulo de categorías y equipos'
              )
            }
          >
            <Text style={styles.placeholderButtonIcon}>🔜</Text>
            <Text style={styles.placeholderButtonText}>
              Asignar a Equipos (Próximamente)
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  activityTextContainer: {
    flex: 1,
  },
  activityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  activityDesc: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  activityHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  hintIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  hintText: {
    flex: 1,
    fontSize: 11,
    color: '#1E40AF',
    fontWeight: '500',
  },
  comingSoonCard: {
    backgroundColor: '#FFF7ED',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FDBA74',
    alignItems: 'center',
    marginBottom: 20,
  },
  comingSoonIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9A3412',
    marginBottom: 8,
  },
  comingSoonDesc: {
    fontSize: 14,
    color: '#9A3412',
    textAlign: 'center',
    marginBottom: 16,
  },
  featureList: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  featureBullet: {
    fontSize: 16,
    color: '#EA580C',
    marginRight: 8,
    fontWeight: 'bold',
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#78350F',
  },
  placeholderButton: {
    flexDirection: 'row',
    backgroundColor: '#FED7AA',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FB923C',
  },
  placeholderButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  placeholderButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9A3412',
  },
});

export default ActivityAssignmentScreen;

