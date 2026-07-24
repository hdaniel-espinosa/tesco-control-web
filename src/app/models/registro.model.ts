export interface Registro {
  idRegistro?: number;
  idTarjeta: string;
  idLaboratorio: number;
  fechaHora: string;
  abrio: boolean;
  nombreMaestro: string | null;
}
