export interface Horario {
  idHorario?: number;
  dia: string;
  horaInicio: string;
  horaTermino: string;
  idLaboratorio: number;
  idMateria: number;
}

/** Horario enriquecido con los nombres de laboratorio, materia y maestro(s), como lo devuelve el backend. */
export interface HorarioDetalle {
  idHorario: number;
  dia: string;
  horaInicio: string;
  horaTermino: string;
  idLaboratorio: number;
  nombreLaboratorio: string | null;
  idMateria: number;
  nombreMateria: string | null;
  maestros: string[];
}

export interface HorarioProximo {
  horario: HorarioDetalle;
  minutosParaInicio: number;
}

/**
 * Debe coincidir exactamente (acentos incluidos) con lo que produce
 * DayOfWeek#getDisplayName(TextStyle.FULL, Locale("es")) en el backend,
 * ya que AccesoService compara el día actual contra horario.dia.
 */
export const DIAS_SEMANA: string[] = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo'
];
