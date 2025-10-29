import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import DependencyInjection from '../../../../core/di/DependencyInjection';
import CursoDomain from '../../domain/entities/CursoEntity';
import { EnrollCourseController } from '../controllers/EnrollCourseController';

const { width } = Dimensions.get('window');

export const EnrollCourseScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [controller] = useState(() => {
    return DependencyInjection.resolve<EnrollCourseController>('EnrollCourseController');
  });

  const [cursos, setCursos] = useState<CursoDomain[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedCurso, setSelectedCurso] = useState<CursoDomain | null>(null);
  const fabScale = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const unsubscribe = controller.subscribe(() => {
      setCursos([...controller.cursos]);
      setSelectedIndex(controller.seleccionado);
      setIsLoading(controller.isLoading);
    });

    controller.loadCursos();

    return () => unsubscribe();
  }, [controller]);

  useEffect(() => {
    Animated.spring(fabScale, {
      toValue: selectedIndex >= 0 ? 1 : 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [selectedIndex]);

  const handleSelectCourse = (index: number) => {
    controller.seleccionar(index);
  };

  const handleEnroll = async () => {
    if (selectedIndex >= 0) {
      setSelectedCurso(cursos[selectedIndex]);
      await controller.inscribirseEnCursoSeleccionado(
        (message) => {
          setShowSuccessModal(true);
        },
        (error) => {
          Alert.alert('Error', error);
        }
      );
    }
  };

  const handleRefresh = () => {
    controller.loadCursos();
  };

  const renderCourseCard = ({ item, index }: { item: CursoDomain; index: number }) => {
    const isSelected = selectedIndex === index;

    return (
      <TouchableOpacity
        onPress={() => handleSelectCourse(index)}
        style={[
          styles.courseCard,
          isSelected && styles.courseCardSelected,
        ]}
      >
        <View style={styles.courseIcon}>
          <Text style={styles.courseIconText}>🎓</Text>
        </View>
        <View style={styles.courseInfo}>
          <Text style={[styles.courseName, isSelected && styles.courseNameSelected]}>
            {item.nombre}
          </Text>
          {item.descripcion.length > 0 && (
            <Text
              style={[styles.courseDescription, isSelected && styles.courseDescriptionSelected]}
              numberOfLines={2}
            >
              {item.descripcion}
            </Text>
          )}
          <View style={styles.courseMetaRow}>
            <Text style={styles.courseMeta}>
              👥 {item.estudiantesNombres.length} estudiantes
            </Text>
            {item.categorias.length > 0 && (
              <>
                <Text style={styles.metaDivider}>•</Text>
                <Text style={styles.courseMeta}>🏷️ {item.categorias[0]}</Text>
              </>
            )}
          </View>
        </View>
        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkIcon}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderLoadingSkeleton = () => (
    <View>
      {[1, 2, 3].map((key) => (
        <View key={key} style={styles.skeletonCard}>
          <View style={styles.skeletonIcon} />
          <View style={styles.skeletonInfo}>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonDescription} />
          </View>
        </View>
      ))}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>🎓</Text>
      </View>
      <Text style={styles.emptyTitle}>No hay cursos disponibles</Text>
      <Text style={styles.emptySubtitle}>Vuelve más tarde para ver nuevos cursos</Text>
      <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
        <Text style={styles.refreshButtonIcon}>🔄</Text>
        <Text style={styles.refreshButtonText}>Recargar</Text>
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
        <View style={styles.headerIconContainer}>
          <Text style={styles.headerIcon}>📝</Text>
        </View>
        <Text style={styles.headerTitle}>Inscribirse a Curso</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeContent}>
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeTitle}>Únete a un Curso</Text>
              <Text style={styles.welcomeSubtitle}>
                Explora cursos disponibles y comienza tu aprendizaje
              </Text>
            </View>
            <View style={styles.welcomeIconContainer}>
              <Text style={styles.welcomeIcon}>🎓</Text>
            </View>
          </View>
        </View>

        {/* Courses Section */}
        <View style={styles.coursesSection}>
          <View style={styles.coursesSectionHeader}>
            <Text style={styles.coursesSectionIcon}>📋</Text>
            <Text style={styles.coursesSectionTitle}>Cursos Disponibles</Text>
          </View>

          {isLoading ? (
            renderLoadingSkeleton()
          ) : cursos.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              {/* Counter Badge */}
              <View style={styles.counterBadge}>
                <Text style={styles.counterIcon}>ℹ️</Text>
                <Text style={styles.counterText}>
                  {cursos.length} cursos disponibles
                </Text>
                {selectedIndex >= 0 && (
                  <View style={styles.selectedPill}>
                    <Text style={styles.selectedPillText}>Seleccionado</Text>
                  </View>
                )}
              </View>

              {/* Course List */}
              <FlatList
                data={cursos}
                renderItem={renderCourseCard}
                keyExtractor={(item) => (item.id || 0).toString()}
                scrollEnabled={false}
                style={styles.coursesList}
                ItemSeparatorComponent={() => <View style={styles.courseSeparator} />}
              />
            </>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <Animated.View
        style={[
          styles.fab,
          {
            transform: [{ scale: fabScale }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleEnroll}
          style={styles.fabButton}
          disabled={selectedIndex < 0}
        >
          <Text style={styles.fabIcon}>✅</Text>
          <Text style={styles.fabText}>Inscribirse</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIconContainer}>
              <Text style={styles.successIcon}>✓</Text>
            </View>
            <Text style={styles.modalTitle}>¡Inscripción Exitosa!</Text>
            <Text style={styles.modalSubtitle}>
              Te has inscrito correctamente en "{selectedCurso?.nombre}"
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.goBack();
                }}
              >
                <Text style={styles.modalButtonSecondaryText}>Continuar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.goBack();
                  console.log('📤 Compartir - funcionalidad próximamente');
                }}
              >
                <Text style={styles.modalButtonPrimaryText}>Compartir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 12,
  },
  backIcon: {
    fontSize: 24,
    color: '#000',
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  welcomeCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
  },
  welcomeIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeIcon: {
    fontSize: 28,
  },
  coursesSection: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  coursesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  coursesSectionIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  coursesSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  counterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
  },
  counterIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  counterText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
  },
  selectedPill: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  selectedPillText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  coursesList: {
    maxHeight: 400,
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  courseCardSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
    borderWidth: 2,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  courseSeparator: {
    height: 12,
  },
  courseIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  courseIconText: {
    fontSize: 28,
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  courseNameSelected: {
    color: '#2E7D32',
  },
  courseDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  courseDescriptionSelected: {
    color: '#388E3C',
  },
  courseMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseMeta: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  metaDivider: {
    marginHorizontal: 8,
    color: '#999',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkIcon: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    marginBottom: 12,
  },
  skeletonIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    marginRight: 16,
  },
  skeletonInfo: {
    flex: 1,
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonDescription: {
    height: 12,
    width: 150,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
  },
  emptyState: {
    padding: 40,
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  refreshButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  refreshButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  fabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  fabText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: width - 64,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: {
    fontSize: 48,
    color: '#4CAF50',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 12,
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    color: '#666',
    fontWeight: '500',
  },
  modalButtonPrimary: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

