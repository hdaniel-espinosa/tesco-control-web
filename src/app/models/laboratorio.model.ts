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
