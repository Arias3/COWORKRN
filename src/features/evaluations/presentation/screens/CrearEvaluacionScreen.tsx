import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DependencyInjection from '../../../../core/di/DependencyInjection';
import Activity from '../../../activities/domain/entities/Activity';
import { EvaluacionPeriodoController } from '../controllers/EvaluacionPeriodoController';

interface RouteParams {
  activity: Activity;
}

const CrearEvaluacionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams;
  const { activity } = params;

  const [controller] = useState<EvaluacionPeriodoController>(() =>
    DependencyInjection.resolve<EvaluacionPeriodoController>(
      'EvaluacionPeriodoController'
    )
  );

  const [titulo, setTitulo] = useState(`Evaluación de Equipo - ${activity.nombre}`);
  const [descripcion, setDescripcion] = useState('');
  const [permitirAutoEvaluacion, setPermitirAutoEvaluacion] = useState(false);
  const [tieneLimiteTiempo, setTieneLimiteTiempo] = useState(false);
  const [duracionHoras, setDuracionHoras] = useState(24);
  const [iniciarInmediatamente, setIniciarInmediatamente] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [tituloError, setTituloError] = useState('');

  useEffect(() => {
    updateDescripcion();
  }, [permitirAutoEvaluacion, tieneLimiteTiempo, duracionHoras, iniciarInmediatamente]);

  const updateDescripcion = () => {
    let desc = 'Evaluación entre compañeros de equipo para medir puntualidad, contribuciones, compromiso y actitud.';

    const opciones: string[] = [];
    if (permitirAutoEvaluacion) opciones.push('Incluye auto-evaluación');
    if (tieneLimiteTiempo) opciones.push(`Límite de ${duracionHoras} horas`);
    if (iniciarInmediatamente) opciones.push('Inicia inmediatamente');
    else opciones.push('Requiere activación manual');

    if (opciones.length > 0) {
      desc += `\n\nOpciones: ${opciones.join(', ')}.`;
    }

    setDescripcion(desc);
  };

  const handleCrearEvaluacion = async () => {
    // Validación
    if (!titulo.trim()) {
      setTituloError('El título es obligatorio');
      return;
    }
    setTituloError('');

    // TODO: Get current user from auth
    const profesorId = '1'; // Placeholder

    try {
      setIsLoading(true);

      const success = await controller.crearEvaluacionPeriodo({
        actividadId: activity.id!.toString(),
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        fechaInicio: iniciarInmediatamente ? new Date() : new Date(),
        fechaFin: tieneLimiteTiempo
          ? new Date(Date.now() + duracionHoras * 60 * 60 * 1000)
          : undefined,
        profesorId,
        evaluacionEntrePares: true,
        permitirAutoEvaluacion,
        criteriosEvaluacion: ['Puntualidad', 'Contribuciones', 'Compromiso', 'Actitud'],
        habilitarComentarios: true,
        puntuacionMaxima: 5.0,
      });

      if (success) {
        // Si debe iniciar inmediatamente, activar
        if (iniciarInmediatamente && controller.evaluacionActual) {
          await controller.activarEvaluacion(controller.evaluacionActual.id);
        }

        Alert.alert('Éxito', 'Evaluación creada correctamente', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Error', 'No se pudo crear la evaluación');
      }
    } catch (e) {
      console.error('Error:', e);
      Alert.alert('Error', 'Ocurrió un error al crear la evaluación');
    } finally {
      setIsLoading(false);
    }
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
        <Text style={styles.headerTitle}>Crear Evaluación</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Activity Info */}
        <View style={styles.activityCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.activityIcon}>📋</Text>
            <Text style={styles.cardHeaderTitle}>Actividad</Text>
          </View>
          <Text style={styles.activityName}>{activity.nombre}</Text>
          <Text style={styles.activityDescription}>{activity.descripcion}</Text>
        </View>

        {/* Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración de la Evaluación</Text>

          {/* Título */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Título de la Evaluación *</Text>
            <TextInput
              style={[styles.input, tituloError ? styles.inputError : null]}
              value={titulo}
              onChangeText={(text) => {
                setTitulo(text);
                setTituloError('');
              }}
              placeholder="Ingresa el título..."
              placeholderTextColor="#9CA3AF"
            />
            {tituloError ? (
              <Text style={styles.errorText}>{tituloError}</Text>
            ) : null}
          </View>

          {/* Descripción */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Describe el propósito de esta evaluación..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Opciones */}
          <Text style={styles.subsectionTitle}>Opciones</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchTitle}>Permitir auto-evaluación</Text>
              <Text style={styles.switchSubtitle}>
                Los estudiantes pueden evaluarse a sí mismos
              </Text>
            </View>
            <Switch
              value={permitirAutoEvaluacion}
              onValueChange={setPermitirAutoEvaluacion}
              trackColor={{ false: '#D1D5DB', true: '#9333EA' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchTitle}>Establecer límite de tiempo</Text>
              <Text style={styles.switchSubtitle}>
                La evaluación se cerrará automáticamente
              </Text>
            </View>
            <Switch
              value={tieneLimiteTiempo}
              onValueChange={setTieneLimiteTiempo}
              trackColor={{ false: '#D1D5DB', true: '#9333EA' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {tieneLimiteTiempo && (
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>
                Duración: {duracionHoras} horas
              </Text>
              <View style={styles.durationButtons}>
                <TouchableOpacity
                  style={styles.durationButton}
                  onPress={() => setDuracionHoras(24)}
                >
                  <Text style={styles.durationButtonText}>1 día</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.durationButton}
                  onPress={() => setDuracionHoras(72)}
                >
                  <Text style={styles.durationButtonText}>3 días</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.durationButton}
                  onPress={() => setDuracionHoras(168)}
                >
                  <Text style={styles.durationButtonText}>1 semana</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchTitle}>Iniciar inmediatamente</Text>
              <Text style={styles.switchSubtitle}>
                Los estudiantes podrán evaluar de inmediato
              </Text>
            </View>
            <Switch
              value={iniciarInmediatamente}
              onValueChange={setIniciarInmediatamente}
              trackColor={{ false: '#D1D5DB', true: '#9333EA' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Criterios Info */}
        <View style={styles.criteriosCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.activityIcon}>✅</Text>
            <Text style={styles.cardHeaderTitle}>Criterios de Evaluación</Text>
          </View>
          <Text style={styles.criteriosText}>
            Los estudiantes evaluarán a sus compañeros en los siguientes aspectos:
          </Text>

          <View style={styles.criterioItem}>
            <Text style={styles.criterioIcon}>📅</Text>
            <View style={styles.criterioTextContainer}>
              <Text style={styles.criterioTitle}>Puntualidad</Text>
              <Text style={styles.criterioSubtitle}>
                Asistencia y cumplimiento de horarios
              </Text>
            </View>
          </View>

          <View style={styles.criterioItem}>
            <Text style={styles.criterioIcon}>💡</Text>
            <View style={styles.criterioTextContainer}>
              <Text style={styles.criterioTitle}>Contribuciones</Text>
              <Text style={styles.criterioSubtitle}>
                Aportes al trabajo del equipo
              </Text>
            </View>
          </View>

          <View style={styles.criterioItem}>
            <Text style={styles.criterioIcon}>🎯</Text>
            <View style={styles.criterioTextContainer}>
              <Text style={styles.criterioTitle}>Compromiso</Text>
              <Text style={styles.criterioSubtitle}>
                Dedicación y responsabilidad
              </Text>
            </View>
          </View>

          <View style={styles.criterioItem}>
            <Text style={styles.criterioIcon}>🤝</Text>
            <View style={styles.criterioTextContainer}>
              <Text style={styles.criterioTitle}>Actitud</Text>
              <Text style={styles.criterioSubtitle}>
                Comportamiento y colaboración
              </Text>
            </View>
          </View>

          <View style={styles.escalaCard}>
            <Text style={styles.escalaTitle}>Escala de Calificación:</Text>
            <Text style={styles.escalaItem}>• Necesita Mejorar: 2.0</Text>
            <Text style={styles.escalaItem}>• Adecuado: 3.0</Text>
            <Text style={styles.escalaItem}>• Bueno: 4.0</Text>
            <Text style={styles.escalaItem}>• Excelente: 5.0</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.createButton, isLoading && styles.buttonDisabled]}
            onPress={handleCrearEvaluacion}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.createButtonText}>Creando evaluación...</Text>
              </View>
            ) : (
              <View style={styles.buttonRow}>
                <Text style={styles.buttonIcon}>
                  {iniciarInmediatamente ? '▶️' : '➕'}
                </Text>
                <Text style={styles.createButtonText}>
                  {iniciarInmediatamente
                    ? 'Crear e Iniciar Evaluación'
                    : 'Crear Evaluación'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
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
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  activityCard: {
    backgroundColor: '#EFF6FF',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
  },
  activityName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  switchSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  sliderContainer: {
    marginVertical: 12,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  durationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  durationButton: {
    flex: 1,
    backgroundColor: '#EDE9FE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  durationButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
  },
  criteriosCard: {
    backgroundColor: '#D1FAE5',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  criteriosText: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 12,
  },
  criterioItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  criterioIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  criterioTextContainer: {
    flex: 1,
  },
  criterioTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  criterioSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  escalaCard: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  escalaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  escalaItem: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 2,
  },
  buttonsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  createButton: {
    backgroundColor: '#9333EA',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CrearEvaluacionScreen;
