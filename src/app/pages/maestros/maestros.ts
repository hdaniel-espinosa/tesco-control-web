import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';

import { HorarioDetalle } from '../../models/horario.model';
import { Materia } from '../../models/materia.model';
import { Tarjeta } from '../../models/tarjeta.model';
import { Usuario } from '../../models/usuario.model';
import { HorarioService } from '../../services/horario.service';
import { MateriaService } from '../../services/materia.service';
import { TarjetaService } from '../../services/tarjeta.service';
import { UsuarioService } from '../../services/usuario.service';

const USUARIO_VACIO: Usuario = {
  nombre: '',
  apPaterno: '',
  apMaterno: '',
  correo: '',
  telefono: '',
  activo: true,
  tipoUsuario: 'Maestro'
};

@Component({
  selector: 'app-maestros',
  imports: [FormsModule],
  templateUrl: './maestros.html'
})
export class Maestros {
  private readonly usuarioService = inject(UsuarioService);
  private readonly tarjetaService = inject(TarjetaService);
  private readonly materiaService = inject(MateriaService);
  private readonly horarioService = inject(HorarioService);
  private readonly toastr = inject(ToastrService);

  readonly usuarios = signal<Usuario[]>([]);
  readonly tarjetas = signal<Tarjeta[]>([]);
  readonly materias = signal<Materia[]>([]);
  readonly cargando = signal(true);
  readonly enEdicion = signal<Usuario | null>(null);

  readonly gestionando = signal<Usuario | null>(null);
  readonly tarjetaAsignada = signal<string | null>(null);
  readonly materiasAsignadas = signal<Set<number>>(new Set());
  readonly tarjetaSeleccionada = signal<string>('');
  readonly horariosDelMaestro = signal<HorarioDetalle[]>([]);

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    forkJoin({
      usuarios: this.usuarioService.getAll(),
      tarjetas: this.tarjetaService.getAll(),
      materias: this.materiaService.getAll()
    }).subscribe({
      next: ({ usuarios, tarjetas, materias }) => {
        this.usuarios.set(usuarios);
        this.tarjetas.set(tarjetas);
        this.materias.set(materias);
        this.cargando.set(false);
      },
      error: () => {
        this.toastr.error('No se pudo cargar la información de maestros');
        this.cargando.set(false);
      }
    });
  }

  nuevo(): void {
    this.enEdicion.set({ ...USUARIO_VACIO });
  }

  editar(usuario: Usuario): void {
    this.enEdicion.set({ ...usuario });
  }

  cancelar(): void {
    this.enEdicion.set(null);
  }

  guardar(): void {
    const usuario = this.enEdicion();
    if (!usuario) {
      return;
    }

    const peticion = usuario.idUsuario
      ? this.usuarioService.update(usuario.idUsuario, usuario)
      : this.usuarioService.create(usuario);

    peticion.subscribe({
      next: (mensaje) => {
        this.toastr.success(mensaje);
        this.enEdicion.set(null);
        this.cargar();
      },
      error: () => this.toastr.error('No se pudo guardar el maestro')
    });
  }

  eliminar(usuario: Usuario): void {
    if (!usuario.idUsuario || !confirm(`¿Eliminar al maestro "${usuario.nombre} ${usuario.apPaterno}"?`)) {
      return;
    }

    this.usuarioService.delete(usuario.idUsuario).subscribe({
      next: (mensaje) => {
        this.toastr.success(mensaje);
        if (this.gestionando()?.idUsuario === usuario.idUsuario) {
          this.gestionando.set(null);
        }
        this.cargar();
      },
      error: () => this.toastr.error('No se pudo eliminar el maestro')
    });
  }

  gestionar(usuario: Usuario): void {
    if (!usuario.idUsuario) {
      return;
    }
    this.gestionando.set(usuario);
    this.tarjetaSeleccionada.set('');

    forkJoin({
      tarjetas: this.tarjetaService.getTarjetasDeUsuario(usuario.idUsuario),
      materias: this.materiaService.getMateriasDeUsuario(usuario.idUsuario)
    }).subscribe({
      next: ({ tarjetas, materias }) => {
        this.tarjetaAsignada.set(tarjetas[0] ?? null);
        this.materiasAsignadas.set(new Set(materias));
      },
      error: () => this.toastr.error('No se pudo cargar la tarjeta y materias del maestro')
    });

    this.cargarHorarios(usuario.idUsuario);
  }

  private cargarHorarios(idUsuario: number): void {
    this.horarioService.getDeUsuario(idUsuario).subscribe({
      next: (horarios) => this.horariosDelMaestro.set(horarios),
      error: () => this.toastr.error('No se pudieron cargar los horarios del maestro')
    });
  }

  cerrarGestion(): void {
    this.gestionando.set(null);
    this.horariosDelMaestro.set([]);
  }

  tarjetasDisponibles(): Tarjeta[] {
    return this.tarjetas().filter((tarjeta) => tarjeta.activa);
  }

  asignarTarjeta(): void {
    const usuario = this.gestionando();
    const idTarjeta = this.tarjetaSeleccionada();
    if (!usuario?.idUsuario || !idTarjeta) {
      return;
    }

    this.tarjetaService.asignarAUsuario(idTarjeta, usuario.idUsuario).subscribe({
      next: (mensaje) => {
        this.toastr.success(mensaje);
        this.tarjetaAsignada.set(idTarjeta);
        this.tarjetaSeleccionada.set('');
      },
      error: () => this.toastr.error('No se pudo asignar la tarjeta')
    });
  }

  desasignarTarjeta(): void {
    const idTarjeta = this.tarjetaAsignada();
    if (!idTarjeta) {
      return;
    }

    this.tarjetaService.desasignar(idTarjeta).subscribe({
      next: (mensaje) => {
        this.toastr.success(mensaje);
        this.tarjetaAsignada.set(null);
      },
      error: () => this.toastr.error('No se pudo desasignar la tarjeta')
    });
  }

  tieneMateria(idMateria: number): boolean {
    return this.materiasAsignadas().has(idMateria);
  }

  toggleMateria(idMateria: number, asignar: boolean): void {
    const usuario = this.gestionando();
    if (!usuario?.idUsuario) {
      return;
    }

    const peticion = asignar
      ? this.materiaService.asignarAUsuario(usuario.idUsuario, idMateria)
      : this.materiaService.desasignarDeUsuario(usuario.idUsuario, idMateria);

    peticion.subscribe({
      next: (mensaje) => {
        this.toastr.success(mensaje);
        const materias = new Set(this.materiasAsignadas());
        if (asignar) {
          materias.add(idMateria);
        } else {
          materias.delete(idMateria);
        }
        this.materiasAsignadas.set(materias);
        this.cargarHorarios(usuario.idUsuario as number);
      },
      error: () => this.toastr.error('No se pudo actualizar la materia del maestro')
    });
  }
}
