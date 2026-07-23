export interface Usuario {
  idUsuario?: number;
  nombre: string;
  apPaterno: string;
  apMaterno: string;
  correo: string;
  telefono: string;
  activo: boolean;
  tipoUsuario: string;
}
