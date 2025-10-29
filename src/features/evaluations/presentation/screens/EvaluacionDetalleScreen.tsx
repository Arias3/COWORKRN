import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Activity from '../../../activities/domain/entities/Activity';
import { EstadoEvaluacionPeriodo, EvaluacionPeriodo } from '../../domain/entities/EvaluacionPeriodo';

interface RouteParams {
  evaluacion: EvaluacionPeriodo;
  activity: Activity;
}

const EvaluacionDetalleScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams;
  const { evaluacion, activity } = params;

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Detalle de Evaluación</Text>
          <Text style={styles.headerSubtitle}>{activity.nombre}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Evaluación Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📊</Text>
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>{evaluacion.titulo}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { borderColor: getStatusColor(evaluacion.estado) },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(evaluacion.estado) },
                  ]}
                >
                  {getStatusText(evaluacion.estado)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoDivider} />

          {evaluacion.descripcion && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Descripción:</Text>
              <Text style={styles.infoValue}>{evaluacion.descripcion}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha de creación:</Text>
            <Text style={styles.infoValue}>
              {formatDate(evaluacion.fechaCreacion)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha de inicio:</Text>
            <Text style={styles.infoValue}>
              {formatDate(evaluacion.fechaInicio)}
            </Text>
          </View>

          {evaluacion.fechaFin && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha de fin:</Text>
              <Text style={styles.infoValue}>
                {formatDate(evaluacion.fechaFin)}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Evaluación entre pares:</Text>
            <Text style={styles.infoValue}>
              {evaluacion.evaluacionEntrePares ? 'Sí' : 'No'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Permitir auto-evaluación:</Text>
            <Text style={styles.infoValue}>
              {evaluacion.permitirAutoEvaluacion ? 'Sí' : 'No'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Comentarios habilitados:</Text>
            <Text style={styles.infoValue}>
              {evaluacion.habilitarComentarios ? 'Sí' : 'No'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Puntuación máxima:</Text>
            <Text style={styles.infoValue}>{evaluacion.puntuacionMaxima}</Text>
          </View>
        </View>

        {/* Criterios */}
        <View style={styles.criteriosCard}>
          <Text style={styles.cardTitle}>Criterios de Evaluación</Text>
          {evaluacion.criteriosEvaluacion.map((criterio, index) => (
            <View key={index} style={styles.criterioItem}>
              <Text style={styles.criterioBullet}>•</Text>
              <Text style={styles.criterioText}>{criterio}</Text>
            </View>
          ))}
        </View>

        {/* Coming Soon Section */}
        <View style={styles.comingSoonCard}>
          <View style={styles.comingSoonIconContainer}>
            <Text style={styles.comingSoonIcon}>🚧</Text>
          </View>
          <Text style={styles.comingSoonTitle}>
            Estadísticas en Desarrollo
          </Text>
          <Text style={styles.comingSoonSubtitle}>
            Esta sección mostrará estadísticas completas
          </Text>

          <View style={styles.featuresList}>
            <Text style={styles.featuresTitle}>Próximamente:</Text>

            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>
                Promedios por estudiante y equipo
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>
                Progreso de evaluaciones completadas
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>
                Gráficos de distribución de calificaciones
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>
                Lista detallada de evaluaciones individuales
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>Comentarios de estudiantes</Text>
            </View>
          </View>
        </View>

        {/* Implementation Notes */}
        <View style={styles.notesCard}>
          <View style={styles.notesHeader}>
            <Text style={styles.notesIcon}>ℹ️</Text>
            <Text style={styles.notesTitle}>Notas de Implementación</Text>
          </View>
          <Text style={styles.notesText}>
            Esta pantalla requiere EvaluacionDetalleControllerTemp con métodos
            para cargar estadísticas completas.
          </Text>
          <Text style={styles.notesText}>
            Se necesitan repositorios de Usuario y Equipo para obtener nombres y
            datos detallados.
          </Text>
          <Text style={styles.notesText}>
            La pantalla original en Flutter tiene 1140+ líneas con tabs,
            gráficos y listas complejas.
          </Text>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 28,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  criteriosCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  criterioItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  criterioBullet: {
    fontSize: 16,
    color: '#9333EA',
    marginRight: 8,
    fontWeight: 'bold',
  },
  criterioText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
  },
  comingSoonCard: {
    backgroundColor: '#FFF7ED',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FED7AA',
  },
  comingSoonIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  comingSoonIcon: {
    fontSize: 40,
  },
  comingSoonTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#EA580C',
    marginBottom: 8,
    textAlign: 'center',
  },
  comingSoonSubtitle: {
    fontSize: 16,
    color: '#9A3412',
    textAlign: 'center',
    marginBottom: 24,
  },
  featuresList: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  featureBullet: {
    fontSize: 16,
    color: '#FB923C',
    marginRight: 8,
    fontWeight: 'bold',
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  notesCard: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  notesIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  notesText: {
    fontSize: 14,
    color: '#1E3A8A',
    lineHeight: 20,
    marginBottom: 6,
  },
});

export default EvaluacionDetalleScreen;
