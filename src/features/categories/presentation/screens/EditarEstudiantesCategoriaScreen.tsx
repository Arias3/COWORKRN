import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CategoriaEquipo } from '../../domain/entities/CategoriaEquipoEntity';
import { TipoAsignacion } from '../../domain/entities/TipoAsignacion';

interface RouteParams {
  categoria: CategoriaEquipo;
}

const EditarEstudiantesCategoriaScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams;
  const { categoria } = params;

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
          <Text style={styles.headerTitle}>Editar Estudiantes</Text>
          <Text style={styles.headerSubtitle}>{categoria.nombre}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Categoría Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📝</Text>
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>{categoria.nombre}</Text>
              <Text style={styles.infoSubtitle}>
                {categoria.tipoAsignacion === TipoAsignacion.MANUAL ? 'Asignación Manual' : 'Asignación Aleatoria'}
              </Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Máx. estudiantes por equipo:</Text>
            <Text style={styles.infoValue}>{categoria.maxEstudiantesPorEquipo}</Text>
          </View>

          {categoria.descripcion && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Descripción:</Text>
              <Text style={styles.infoDescription}>{categoria.descripcion}</Text>
            </View>
          )}
        </View>

        {/* Coming Soon Section */}
        <View style={styles.comingSoonContainer}>
          <View style={styles.comingSoonCard}>
            <View style={styles.comingSoonIconContainer}>
              <Text style={styles.comingSoonIcon}>🚧</Text>
            </View>
            <Text style={styles.comingSoonTitle}>Funcionalidad en Desarrollo</Text>
            <Text style={styles.comingSoonSubtitle}>
              Esta pantalla está siendo desarrollada
            </Text>

            <View style={styles.featuresList}>
              <Text style={styles.featuresTitle}>Funcionalidades planeadas:</Text>

              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>
                  Ver todos los equipos de la categoría
                </Text>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>
                  Agregar estudiantes a equipos desde lista de estudiantes sin equipo
                </Text>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>
                  Remover estudiantes de equipos
                </Text>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>
                  Mover estudiantes entre equipos
                </Text>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>
                  Estadísticas: total de equipos, estudiantes, y estudiantes sin equipo
                </Text>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>
                  Control de capacidad máxima por equipo
                </Text>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>
                  Guardar cambios con detección de modificaciones pendientes
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
              El controlador CategoriaEquipoController ya tiene los métodos{' '}
              <Text style={styles.codeText}>addStudentToTeam()</Text> y{' '}
              <Text style={styles.codeText}>removeStudentFromTeam()</Text>.
            </Text>
            <Text style={styles.notesText}>
              Se requiere implementar:
            </Text>
            <Text style={styles.notesText}>
              • Método para obtener estudiantes del curso
            </Text>
            <Text style={styles.notesText}>
              • Lógica para organizar estudiantes por equipo
            </Text>
            <Text style={styles.notesText}>
              • Sistema de cambios pendientes y guardado por lotes
            </Text>
          </View>
        </View>

        {/* Placeholder Button */}
        <TouchableOpacity style={styles.placeholderButton}>
          <Text style={styles.placeholderButtonText}>Próximamente</Text>
        </TouchableOpacity>
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
    backgroundColor: '#3B82F6',
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
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DBEAFE',
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
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  infoRow: {
    marginTop: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  infoDescription: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  comingSoonContainer: {
    paddingHorizontal: 16,
  },
  comingSoonCard: {
    backgroundColor: '#FFF7ED',
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
    padding: 20,
    borderRadius: 12,
    marginTop: 16,
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
  codeText: {
    fontFamily: 'monospace',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 13,
  },
  placeholderButton: {
    backgroundColor: '#FB923C',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#FB923C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  placeholderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default EditarEstudiantesCategoriaScreen;
