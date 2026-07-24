import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';

import { DIAS_SEMANA, Horario } from '../../models/horario.model';
import { Laboratorio } from '../../models/laboratorio.model';
import { Materia } from '../../models/materia.model';
import { HorarioService } from '../../services/horario.service';
import { LaboratorioService } from '../../services/laboratorio.service';
import { MateriaService } from '../../services/materia.service';

const HORARIO_VACIO: Horario = {
  dia: DIAS_SEMANA[0],
  horaInicio: '07:00',
  horaTermino: '08:00',
  idLaboratorio: 0,
  idMateria: 0
};

@Component({
  selector: 'app-horarios',
  imports: [FormsModule],
  templateUrl: './horarios.html'
})
export class Horarios {
  private readonly horarioService = inject(HorarioService);
  private readonly laboratorioService = inject(LaboratorioService);
  private readonly materiaService = inject(MateriaService);
  private readonly toastr = inject(ToastrService);

  readonly dias = DIAS_SEMANA;
  readonly horarios = signal<Horario[]>([]);
  readonly laboratorios = signal<Laboratorio[]>([]);
  readonly materias = signal<Materia[]>([]);
  readonly cargando = signal(true);
  readonly enEdicion = signal<Horario | null>(null);

  readonly laboratoriosPorId = computed(
    () => new Map(this.laboratorios().map((laboratorio) => [laboratorio.idLaboratorio, laboratorio]))
  );
  readonly materiasPorId = computed(() => new Map(this.materias().map((materia) => [materia.idMateria, materia])));

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    forkJoin({
      horarios: this.horarioService.getAll(),
      laboratorios: this.laboratorioService.getAll(),
      materias: this.materiaService.getAll()
    }).subscribe({
      next: ({ horarios, laboratorios, materias }) => {
        this.horarios.set(horarios);
        this.laboratorios.set(laboratorios);
        this.materias.set(materias);
        this.cargando.set(false);
      },
      error: () => {
        this.toastr.error('No se pudo cargar la información de horarios');
        this.cargando.set(false);
      }
    });
  }

  nombreLaboratorio(idLaboratorio: number): string {
    return this.laboratoriosPorId().get(idLaboratorio)?.nombre ?? `#${idLaboratorio}`;
  }

  nombreMateria(idMateria: number): string {
    const materia = this.materiasPorId().get(idMateria);
    return materia ? `${materia.nombre} (${materia.grupo})` : `#${idMateria}`;
  }

  nuevo(): void {
    this.enEdicion.set({
      ...HORARIO_VACIO,
      idLaboratorio: this.laboratorios()[0]?.idLaboratorio ?? 0,
      idMateria: this.materias()[0]?.idMateria ?? 0
    });
  }

  editar(horario: Horario): void {
    this.enEdicion.set({
      ...horario,
      horaInicio: this.aHoraDeFormulario(horario.horaInicio),
      horaTermino: this.aHoraDeFormulario(horario.horaTermino)
    });
  }

  cancelar(): void {
    this.enEdicion.set(null);
  }

  private aHoraDeFormulario(hora: string): string {
    return hora.slice(0, 5);
  }

  private aHoraDeApi(hora: string): string {
    return hora.length === 5 ? `${hora}:00` : hora;
  }

  guardar(): void {
    const formulario = this.enEdicion();
    if (!formulario) {
      return;
    }

    const horario: Horario = {
      ...formulario,
      horaInicio: this.aHoraDeApi(formulario.horaInicio),
      horaTermino: this.aHoraDeApi(formulario.horaTermino)
    };

    const peticion = horario.idHorario
      ? this.horarioService.update(horario.idHorario, horario)
      : this.horarioService.create(horario);

    peticion.subscribe({
      next: (mensaje) => {
        this.toastr.success(mensaje);
        this.enEdicion.set(null);
        this.cargar();
      },
      error: () => this.toastr.error('No se pudo guardar el horario')
    });
  }

  eliminar(horario: Horario): void {
    if (!horario.idHorario || !confirm('¿Eliminar este horario?')) {
      return;
    }

    this.horarioService.delete(horario.idHorario).subscribe({
      next: (mensaje) => {
        this.toastr.success(mensaje);
        this.cargar();
      },
      error: () => this.toastr.error('No se pudo eliminar el horario')
    });
  }
}
