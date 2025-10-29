import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import DependencyInjection from '../../../../core/di/DependencyInjection';
import { Activity } from '../../domain/entities/Activity';
import { ActivityController } from '../controllers/ActivityController';
import setupActivityDI from '../controllers/setupActivityDI';

// Initialize Activity DI on module load
setupActivityDI();

interface RouteParams {
  categoryId: number;
  activity?: Activity;
}

const ActivityFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams;

  const [controller] = useState<ActivityController>(() =>
    DependencyInjection.resolve<ActivityController>('ActivityController')
  );

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deliveryDate, setDeliveryDate] = useState<Date>(new Date());
  const [showDateInput, setShowDateInput] = useState(false);
  const [dateText, setDateText] = useState('');
  const [nameError, setNameError] = useState('');

  const isEditing = params?.activity !== undefined;

  useEffect(() => {
    if (params?.activity) {
      setName(params.activity.nombre || '');
      setDescription(params.activity.descripcion || '');
      setDeliveryDate(
        params.activity.fechaEntrega
          ? new Date(params.activity.fechaEntrega)
          : new Date()
      );
    }
  }, [params?.activity]);

  const validate = (): boolean => {
    if (name.trim().length === 0) {
      setNameError('Ingrese un nombre');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      if (!isEditing) {
        // Crear nueva actividad
        const newActivity = new Activity({
          categoriaId: params.categoryId,
          nombre: name.trim(),
          descripcion: description.trim(),
          fechaEntrega: deliveryDate,
          activo: true,
        });

        await controller.createActivity(
          newActivity,
          () => {
            Alert.alert('Éxito', 'Actividad creada correctamente', [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]);
          },
          (error: string) => {
            Alert.alert('Error', error);
          }
        );
      } else {
        // Actualizar actividad existente
        const updatedActivity = params.activity!.copyWith({
          nombre: name.trim(),
          descripcion: description.trim(),
          fechaEntrega: deliveryDate,
        });

        await controller.updateActivity(
          updatedActivity,
          () => {
            Alert.alert('Éxito', 'Actividad actualizada correctamente', [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]);
          },
          (error: string) => {
            Alert.alert('Error', error);
          }
        );
      }
    } catch (e) {
      Alert.alert('Error', `Ocurrió un error: ${e}`);
    }
  };

  const handleDateChange = (text: string) => {
    setDateText(text);
    // Try to parse date in format DD/MM/YYYY
    const parts = text.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const year = parseInt(parts[2]);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        const newDate = new Date(year, month, day);
        if (newDate.getTime() && !isNaN(newDate.getTime())) {
          setDeliveryDate(newDate);
        }
      }
    }
  };

  const formatDate = (date: Date): string => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
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
        <Text style={styles.headerTitle}>
          {isEditing ? 'Editar Actividad' : 'Nueva Actividad'}
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>
                {isEditing ? '✏️' : '➕'}
              </Text>
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>
                {isEditing ? 'Editar Actividad' : 'Nueva Actividad'}
              </Text>
              <Text style={styles.infoSubtitle}>
                {isEditing
                  ? 'Modifica los datos de la actividad'
                  : 'Completa los datos para crear una nueva actividad'}
              </Text>
            </View>
          </View>

          {/* Nombre Field */}
          <View style={styles.fieldContainer}>
            <View style={styles.inputCard}>
              <View style={styles.inputWrapper}>
                <View style={styles.prefixIcon}>
                  <Text style={styles.prefixIconText}>📝</Text>
                </View>
                <View style={styles.inputContent}>
                  <Text style={styles.label}>Nombre de la actividad</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      if (text.trim().length > 0) {
                        setNameError('');
                      }
                    }}
                    placeholder="Ingrese el nombre"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            </View>
            {nameError.length > 0 && (
              <Text style={styles.errorText}>{nameError}</Text>
            )}
          </View>

          {/* Descripción Field */}
          <View style={styles.fieldContainer}>
            <View style={styles.inputCard}>
              <View style={styles.inputWrapper}>
                <View style={styles.prefixIcon}>
                  <Text style={styles.prefixIconText}>📄</Text>
                </View>
                <View style={styles.inputContent}>
                  <Text style={styles.label}>Descripción</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Ingrese la descripción"
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Fecha de entrega */}
          <View style={styles.fieldContainer}>
            <View style={styles.dateCard}>
              <View style={styles.dateIconContainer}>
                <Text style={styles.dateIcon}>📅</Text>
              </View>
              <View style={styles.dateTextContainer}>
                <Text style={styles.dateLabel}>Fecha de entrega</Text>
                {showDateInput ? (
                  <TextInput
                    style={styles.dateInput}
                    value={dateText}
                    onChangeText={handleDateChange}
                    onBlur={() => setShowDateInput(false)}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    autoFocus
                  />
                ) : (
                  <TouchableOpacity onPress={() => {
                    setDateText(formatDate(deliveryDate));
                    setShowDateInput(true);
                  }}>
                    <Text style={styles.dateValue}>{formatDate(deliveryDate)}</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.arrowContainer}>
                <Text style={styles.arrow}>→</Text>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonIcon}>
              {isEditing ? '💾' : '➕'}
            </Text>
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Guardar Cambios' : 'Crear Actividad'}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 24,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 4,
  },
  prefixIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 12,
  },
  prefixIconText: {
    fontSize: 20,
  },
  inputContent: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    fontSize: 16,
    color: '#1F2937',
    padding: 0,
    minHeight: 24,
  },
  textArea: {
    minHeight: 80,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 16,
  },
  dateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#CFFAFE',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dateIcon: {
    fontSize: 24,
  },
  dateTextContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  dateInput: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
    padding: 0,
    minHeight: 24,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#CFFAFE',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 16,
    color: '#06B6D4',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#6366F1',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default ActivityFormScreen;
