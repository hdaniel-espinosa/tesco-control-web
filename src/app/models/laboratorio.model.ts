import { HorarioDetalle } from './horario.model';

export interface Laboratorio {
  idLaboratorio?: number;
  nombre: string;
  edificio: string;
  nLugares: number;
}

export interface EstadoLaboratorio {
  idEstado?: number;
  idLaboratorio: number;
  fechaHora?: string;
  temperatura: number;
  humedad: number;
}

/** Ocupación del laboratorio "ahora mismo", según el horario programado. */
export interface LaboratorioEstadoOcupacion {
  idLaboratorio: number;
  nombreLaboratorio: string;
  edificio: string;
  nLugares: number;
  ocupado: boolean;
  horarioActual: HorarioDetalle | null;
  proximoHorario: HorarioDetalle | null;
  minutosParaProximo: number | null;
}
