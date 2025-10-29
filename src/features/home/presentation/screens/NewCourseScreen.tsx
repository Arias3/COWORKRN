import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DependencyInjection from '../../../../core/di/DependencyInjection';
import { Usuario } from '../../../auth/domain/entities/UserEntity';
import { NewCourseController } from '../controllers/NewCourseController';

const { width } = Dimensions.get('window');

export const NewCourseScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [controller] = useState(() => {
    return DependencyInjection.resolve<NewCourseController>('NewCourseController');
  });

  const [nombreCurso, setNombreCurso] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [codigoRegistro, setCodigoRegistro] = useState('');
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>([]);
  const [availableCategorias, setAvailableCategorias] = useState<string[]>([]);
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState<Usuario[]>([]);
  const [estudiantesDisponibles, setEstudiantesDisponibles] = useState<Usuario[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    // Subscribe to controller updates
    const unsubscribe = controller.subscribe(() => {
      setNombreCurso(controller.nombreCurso);
      setDescripcion(controller.descripcion);
      setCodigoRegistro(controller.codigoRegistro);
      setSelectedCategorias([...controller.selectedCategorias]);
      setAvailableCategorias([...controller.categorias]);
      setEstudiantesSeleccionados([...controller.estudiantesSeleccionados]);
      setEstudiantesDisponibles([...controller.estudiantesDisponibles]);
      setSearchQuery(controller.searchQuery);
      setIsLoading(controller.isLoading);
      setIsLoadingStudents(controller.isLoadingStudents);
    });

    // Initial load
    controller.cargarEstudiantes();

    return () => unsubscribe();
  }, [controller]);

  const handleCreateCourse = async () => {
    const success = await controller.crearCurso(
      (message) => {
        setShowSuccessModal(true);
      },
      (error) => {
        Alert.alert('Error', error);
      }
    );
  };

  const handleToggleCategoria = (categoria: string) => {
    controller.toggleCategoria(categoria);
  };

  const handleAddStudent = (student: Usuario) => {
    controller.agregarEstudiante(student);
  };

  const handleRemoveStudent = (student: Usuario) => {
    controller.eliminarEstudiante(student);
  };

  const handleGenerateCode = () => {
    controller.generarCodigoAleatorio();
  };

  const renderCategoriaChip = (categoria: string) => {
    const isSelected = selectedCategorias.includes(categoria);
    return (
      <TouchableOpacity
        key={categoria}
        onPress={() => handleToggleCategoria(categoria)}
        style={[
          styles.categoriaChip,
          isSelected && styles.categoriaChipSelected,
        ]}
      >
        {isSelected && <Text style={styles.checkIcon}>✓</Text>}
        <Text style={[styles.categoriaText, isSelected && styles.categoriaTextSelected]}>
          {categoria}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSelectedStudent = ({ item }: { item: Usuario }) => (
    <View style={styles.studentCard}>
      <View style={styles.studentAvatar}>
        <Text style={styles.studentAvatarText}>{item.nombre[0].toUpperCase()}</Text>
      </View>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.nombre}</Text>
        <Text style={styles.studentEmail}>{item.email}</Text>
      </View>
      <TouchableOpacity onPress={() => handleRemoveStudent(item)} style={styles.removeButton}>
        <Text style={styles.removeIcon}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAvailableStudent = ({ item }: { item: Usuario }) => (
    <View style={styles.availableStudentCard}>
      <View style={[styles.studentAvatar, styles.availableAvatar]}>
        <Text style={[styles.studentAvatarText, styles.availableAvatarText]}>
          {item.nombre[0].toUpperCase()}
        </Text>
      </View>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.nombre}</Text>
        <Text style={styles.studentEmail}>{item.email}</Text>
        <Text style={styles.studentDate}>
          Registrado: {new Date(item.creadoEn).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleAddStudent(item)} style={styles.addButton}>
        <Text style={styles.addIcon}>+</Text>
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
          <Text style={styles.headerIcon}>➕</Text>
        </View>
        <Text style={styles.headerTitle}>Crear Nuevo Curso</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeContent}>
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeTitle}>Nuevo Curso</Text>
              <Text style={styles.welcomeSubtitle}>
                Completa la información para crear tu curso
              </Text>
            </View>
            <View style={styles.welcomeIconContainer}>
              <Text style={styles.welcomeIcon}>✨</Text>
            </View>
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Nombre del Curso */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📚</Text>
              <Text style={styles.sectionTitle}>Nombre del curso</Text>
              <Text style={styles.required}>*</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ej: Curso de Flutter Avanzado"
              value={nombreCurso}
              onChangeText={(text) => controller.nombreCurso = text}
            />
          </View>

          {/* Descripción */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📝</Text>
              <Text style={styles.sectionTitle}>Descripción</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe de qué trata tu curso..."
              value={descripcion}
              onChangeText={(text) => controller.descripcion = text}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Código de Registro */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🔑</Text>
              <Text style={styles.sectionTitle}>Código de Registro</Text>
              <Text style={styles.required}>*</Text>
            </View>
            <View style={styles.codeContainer}>
              <Text style={styles.codeHint}>
                Los estudiantes usarán este código para inscribirse al curso:
              </Text>
              <View style={styles.codeInputRow}>
                <TextInput
                  style={[styles.input, styles.codeInput]}
                  placeholder="Ej: PROG001, FLU2024"
                  value={codigoRegistro}
                  onChangeText={(text) => controller.codigoRegistro = text.toUpperCase()}
                  autoCapitalize="characters"
                />
                <TouchableOpacity onPress={handleGenerateCode} style={styles.generateButton}>
                  <Text style={styles.generateButtonText}>🔀 Generar</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoIcon}>ℹ️</Text>
                <Text style={styles.infoText}>
                  Mínimo 4 caracteres. Se recomienda usar letras y números.
                </Text>
              </View>
            </View>
          </View>

          {/* Categorías */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🏷️</Text>
              <Text style={styles.sectionTitle}>Categorías</Text>
            </View>
            <View style={styles.categoriasContainer}>
              <Text style={styles.categoriasHint}>
                Selecciona las categorías que mejor describan tu curso:
              </Text>
              <View style={styles.categoriasWrap}>
                {availableCategorias.map(renderCategoriaChip)}
              </View>
              <Text style={styles.categoriasCount}>
                {selectedCategorias.length} categorías seleccionadas
              </Text>
            </View>
          </View>

          {/* Estudiantes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>👥</Text>
              <Text style={styles.sectionTitle}>Estudiantes Registrados</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar estudiante por nombre o email..."
                value={searchQuery}
                onChangeText={(text) => controller.searchQuery = text}
              />
              <TouchableOpacity
                onPress={() => controller.cargarEstudiantes()}
                style={styles.refreshButton}
                disabled={isLoadingStudents}
              >
                {isLoadingStudents ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.refreshIcon}>🔄</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Selected Students */}
            {estudiantesSeleccionados.length > 0 ? (
              <View style={styles.selectedStudentsContainer}>
                <View style={styles.selectedStudentsHeader}>
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>
                      {estudiantesSeleccionados.length} estudiantes seleccionados
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => controller.limpiarSeleccion()}>
                    <Text style={styles.clearButton}>Limpiar</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={estudiantesSeleccionados}
                  renderItem={renderSelectedStudent}
                  keyExtractor={(item) => (item.id || 0).toString()}
                  style={styles.studentsList}
                  scrollEnabled={false}
                />
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>👥</Text>
                <Text style={styles.emptyTitle}>No hay estudiantes seleccionados</Text>
                <Text style={styles.emptySubtitle}>
                  Busca y selecciona estudiantes registrados
                </Text>
              </View>
            )}

            {/* Available Students */}
            {isLoadingStudents ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Cargando estudiantes...</Text>
              </View>
            ) : estudiantesDisponibles.length > 0 ? (
              <View style={styles.availableStudentsContainer}>
                <View style={styles.availableBadge}>
                  <Text style={styles.availableBadgeText}>
                    {estudiantesDisponibles.length} estudiantes disponibles
                  </Text>
                </View>
                <FlatList
                  data={estudiantesDisponibles}
                  renderItem={renderAvailableStudent}
                  keyExtractor={(item) => (item.id || 0).toString()}
                  style={styles.availableStudentsList}
                  scrollEnabled={false}
                />
              </View>
            ) : (
              <View style={styles.noResultsState}>
                <Text style={styles.noResultsIcon}>🔍</Text>
                <Text style={styles.noResultsTitle}>
                  {searchQuery.length === 0
                    ? 'No hay más estudiantes disponibles'
                    : 'No se encontraron estudiantes'}
                </Text>
                <Text style={styles.noResultsSubtitle}>
                  {searchQuery.length === 0
                    ? 'Todos los estudiantes están seleccionados'
                    : 'Intenta con otros términos de búsqueda'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, isLoading && styles.fabDisabled]}
        onPress={handleCreateCourse}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={styles.fabIcon}>✓</Text>
        )}
        <Text style={styles.fabText}>{isLoading ? 'Creando...' : 'Crear Curso'}</Text>
      </TouchableOpacity>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIconContainer}>
              <Text style={styles.successIcon}>✓</Text>
            </View>
            <Text style={styles.modalTitle}>¡Curso Creado!</Text>
            <Text style={styles.modalSubtitle}>Tu curso ha sido creado exitosamente</Text>
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
                  console.log('📤 Compartir curso - funcionalidad próximamente');
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
    backgroundColor: '#E3F2FD',
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
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#2196F3',
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
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  required: {
    color: '#F44336',
    fontSize: 16,
    marginLeft: 2,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  codeContainer: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  codeHint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  codeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeInput: {
    flex: 1,
    marginRight: 8,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  generateButton: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  generateButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 6,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#1976D2',
    flex: 1,
  },
  categoriasContainer: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoriasHint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  categoriasWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  categoriaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  categoriaChipSelected: {
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
  },
  checkIcon: {
    color: '#FFF',
    fontSize: 16,
    marginRight: 4,
  },
  categoriaText: {
    fontSize: 14,
    color: '#666',
  },
  categoriaTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  categoriasCount: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
  },
  refreshButton: {
    backgroundColor: '#FF9800',
    padding: 12,
    borderRadius: 8,
    margin: 4,
  },
  refreshIcon: {
    fontSize: 20,
  },
  selectedStudentsContainer: {
    marginBottom: 16,
  },
  selectedStudentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  selectedBadgeText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  clearButton: {
    color: '#F44336',
    fontSize: 12,
  },
  studentsList: {
    maxHeight: 200,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 4,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  studentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentAvatarText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 14,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  studentEmail: {
    fontSize: 12,
    color: '#666',
  },
  studentDate: {
    fontSize: 10,
    color: '#999',
  },
  removeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeIcon: {
    color: '#F44336',
    fontSize: 20,
  },
  availableStudentsContainer: {
    marginTop: 16,
  },
  availableBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  availableBadgeText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: '600',
  },
  availableStudentsList: {
    maxHeight: 250,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  availableStudentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 4,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  availableAvatar: {
    backgroundColor: '#E3F2FD',
  },
  availableAvatarText: {
    color: '#2196F3',
  },
  addButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    color: '#4CAF50',
    fontSize: 24,
  },
  emptyState: {
    padding: 32,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
  },
  loadingContainer: {
    padding: 20,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    marginTop: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  noResultsState: {
    padding: 20,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    alignItems: 'center',
    marginTop: 16,
  },
  noResultsIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  noResultsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F57C00',
    marginBottom: 4,
  },
  noResultsSubtitle: {
    fontSize: 12,
    color: '#FF9800',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabDisabled: {
    opacity: 0.6,
  },
  fabIcon: {
    color: '#FFF',
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
    fontSize: 16,
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
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

