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

interface MiembroEquipo {
  id: string;
  nombre: string;
  email?: string;
}

interface RouteParams {
  actividad: Activity;
  miembrosEquipo: MiembroEquipo[];
  evaluacionPeriodoId: string;
  equipoId: string;
}

const RealizarEvaluacionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams;
  const { actividad, miembrosEquipo, evaluacionPeriodoId, equipoId } = params;

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
          <Text style={styles.headerTitle}>Realizar Evaluación</Text>
          <Text style={styles.headerSubtitle}>{actividad.nombre}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>✏️</Text>
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Evalúa a tus Compañeros</Text>
              <Text style={styles.infoSubtitle}>
                {miembrosEquipo.length} miembro(s) del equipo
              </Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <Text style={styles.infoDescription}>
            Califica a cada miembro de tu equipo según los criterios establecidos.
            Sé honesto y constructivo en tus evaluaciones.
          </Text>
        </View>

        {/* Miembros List */}
        <View style={styles.miembrosCard}>
          <Text style={styles.cardTitle}>Miembros del Equipo</Text>
          {miembrosEquipo.map((miembro, index) => (
            <View key={miembro.id} style={styles.miembroItem}>
              <View style={styles.miembroAvatar}>
                <Text style={styles.miembroAvatarText}>
                  {miembro.nombre.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.miembroInfo}>
                <Text style={styles.miembroNombre}>{miembro.nombre}</Text>
                {miembro.email && (
                  <Text style={styles.miembroEmail}>{miembro.email}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Coming Soon Section */}
        <View style={styles.comingSoonCard}>
          <View style={styles.comingSoonIconContainer}>
            <Text style={styles.comingSoonIcon}>🚧</Text>
          </View>
          <Text style={styles.comingSoonTitle}>
            Funcionalidad en Desarrollo
          </Text>
          <Text style={styles.comingSoonSubtitle}>
            El formulario de evaluación está siendo desarrollado
          </Text>

          <View style={styles.featuresList}>
            <Text style={styles.featuresTitle}>Funcionalidades planeadas:</Text>

            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>
                Calificar a cada miembro por criterio (Puntualidad, Contribuciones,
                Compromiso, Actitud)
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>
                Escala de calificación: 2.0 (Necesita Mejorar) a 5.0 (Excelente)
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>
                Agregar comentarios opcionales para cada evaluación
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>
                Auto-evaluación opcional (si está habilitada)
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>
                Cargar evaluaciones existentes para editar
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>
                Enviar evaluación individual por miembro
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>
                Indicador visual de evaluaciones completadas
              </Text>
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
            Esta pantalla requiere EvaluacionIndividualController con métodos
            para crear y actualizar evaluaciones individuales.
          </Text>
          <Text style={styles.notesText}>
            Se necesita integración con RobleAuthLoginController para obtener el
            usuario actual.
          </Text>
          <Text style={styles.notesText}>
            La pantalla original en Flutter tiene 756+ líneas con formularios
            complejos, sliders de calificación y validación.
          </Text>
          <Text style={styles.notesText}>
            Criterios de evaluación: Puntualidad, Contribuciones, Compromiso,
            Actitud (enum CriterioEvaluacion).
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
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  infoDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  miembrosCard: {
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
    marginBottom: 16,
  },
  miembroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  miembroAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miembroAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  miembroInfo: {
    flex: 1,
    marginLeft: 12,
  },
  miembroNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  miembroEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
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

export default RealizarEvaluacionScreen;
