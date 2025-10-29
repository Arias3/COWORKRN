/**
 * CriterioEvaluacion Enum
 * 
 * Defines evaluation criteria for peer and self-evaluation.
 */

export enum CriterioEvaluacion {
  PUNTUALIDAD = 'puntualidad',
  CONTRIBUCIONES = 'contribuciones',
  COMPROMISO = 'compromiso',
  ACTITUD = 'actitud',
}

export const CriterioEvaluacionData: Record<CriterioEvaluacion, {
  nombre: string;
  descripcion: string;
  key: string;
}> = {
  [CriterioEvaluacion.PUNTUALIDAD]: {
    nombre: 'Puntualidad',
    descripcion: 'Asistencia y cumplimiento de horarios',
    key: 'puntualidad',
  },
  [CriterioEvaluacion.CONTRIBUCIONES]: {
    nombre: 'Contribuciones',
    descripcion: 'Aportes al trabajo del equipo',
    key: 'contribuciones',
  },
  [CriterioEvaluacion.COMPROMISO]: {
    nombre: 'Compromiso',
    descripcion: 'Dedicación y responsabilidad',
    key: 'compromiso',
  },
  [CriterioEvaluacion.ACTITUD]: {
    nombre: 'Actitud',
    descripcion: 'Comportamiento y colaboración',
    key: 'actitud',
  },
};

/**
 * NivelEvaluacion Enum
 * 
 * Defines evaluation levels with corresponding scores.
 */

export enum NivelEvaluacion {
  NECESITA_MEJORAR = 'necesitaMejorar',
  ADECUADO = 'adecuado',
  BUENO = 'bueno',
  EXCELENTE = 'excelente',
}

export const NivelEvaluacionData: Record<NivelEvaluacion, {
  calificacion: number;
  nombre: string;
  descripcion: string;
}> = {
  [NivelEvaluacion.NECESITA_MEJORAR]: {
    calificacion: 2.0,
    nombre: 'Necesita mejorar',
    descripcion: 'Requiere atención y mejora',
  },
  [NivelEvaluacion.ADECUADO]: {
    calificacion: 3.0,
    nombre: 'Adecuado',
    descripcion: 'Cumple con lo mínimo esperado',
  },
  [NivelEvaluacion.BUENO]: {
    calificacion: 4.0,
    nombre: 'Bueno',
    descripcion: 'Supera las expectativas',
  },
  [NivelEvaluacion.EXCELENTE]: {
    calificacion: 5.0,
    nombre: 'Excelente',
    descripcion: 'Desempeño sobresaliente',
  },
};

export default CriterioEvaluacion;
