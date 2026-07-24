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

/** Franja del calendario semanal: cubre el día completo para no recortar horarios fuera de un rango fijo. */
const CALENDARIO_INICIO_MIN = 0;
const CALENDARIO_FIN_MIN = 24 * 60;
const CALENDARIO_TOTAL_MIN = CALENDARIO_FIN_MIN - CALENDARIO_INICIO_MIN;
const CALENDARIO_PX_POR_HORA = 50;
const DURACION_POR_DEFECTO_MIN = 60;
const SNAP_MIN = 30;

interface BloqueCalendario {
  horario: Horario;
  topPct: number;
  heightPct: number;
}

@Component({
  selector: 'app-horarios',
  imports: [FormsModule],
  templateUrl: './horarios.html',
  styleUrl: './horarios.scss'
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

  readonly laboratorioCalendario = signal<number | null>(null);

  readonly laboratoriosPorId = computed(
    () => new Map(this.laboratorios().map((laboratorio) => [laboratorio.idLaboratorio, laboratorio]))
  );
  readonly materiasPorId = computed(() => new Map(this.materias().map((materia) => [materia.idMateria, materia])));

  readonly horasEtiqueta = Array.from(
    { length: CALENDARIO_TOTAL_MIN / 60 + 1 },
    (_, index) => CALENDARIO_INICIO_MIN / 60 + index
  );
  readonly alturaCalendarioPx = (CALENDARIO_TOTAL_MIN / 60) * CALENDARIO_PX_POR_HORA;

  private readonly horariosDelLaboratorio = computed(() =>
    this.horarios().filter((horario) => horario.idLaboratorio === this.laboratorioCalendario())
  );

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

  porcentajeHora(hora: number): number {
    return ((hora * 60 - CALENDARIO_INICIO_MIN) / CALENDARIO_TOTAL_MIN) * 100;
  }

  bloquesDelDia(dia: string): BloqueCalendario[] {
    return this.horariosDelLaboratorio()
      .filter((horario) => horario.dia === dia)
      .map((horario) => {
        const inicio = this.minutosDesde(horario.horaInicio);
        const termino = this.minutosDesde(horario.horaTermino);
        const topPct = this.aPorcentaje(inicio);
        const finPct = this.aPorcentaje(termino);
        return { horario, topPct, heightPct: Math.max(finPct - topPct, 2) };
      });
  }

  private aPorcentaje(minutos: number): number {
    const acotado = Math.min(Math.max(minutos, CALENDARIO_INICIO_MIN), CALENDARIO_FIN_MIN);
    return ((acotado - CALENDARIO_INICIO_MIN) / CALENDARIO_TOTAL_MIN) * 100;
  }

  private minutosDesde(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }

  private formatoHora(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  onColumnClick(dia: string, event: MouseEvent): void {
    const idLaboratorio = this.laboratorioCalendario();
    if (!idLaboratorio) {
      return;
    }

    const elemento = event.currentTarget as HTMLElement;
    const rect = elemento.getBoundingClientRect();
    const fraccion = (event.clientY - rect.top) / rect.height;
    let inicioMin = CALENDARIO_INICIO_MIN + fraccion * CALENDARIO_TOTAL_MIN;
    inicioMin = Math.round(inicioMin / SNAP_MIN) * SNAP_MIN;
    inicioMin = Math.min(Math.max(inicioMin, CALENDARIO_INICIO_MIN), CALENDARIO_FIN_MIN - SNAP_MIN);
    const terminoMin = Math.min(inicioMin + DURACION_POR_DEFECTO_MIN, CALENDARIO_FIN_MIN);

    this.enEdicion.set({
      ...HORARIO_VACIO,
      dia,
      horaInicio: this.formatoHora(inicioMin),
      horaTermino: this.formatoHora(terminoMin),
      idLaboratorio,
      idMateria: this.materias()[0]?.idMateria ?? 0
    });
  }

  onBlockClick(horario: Horario, event: MouseEvent): void {
    event.stopPropagation();
    this.editar(horario);
  }

  nuevo(): void {
    this.enEdicion.set({
      ...HORARIO_VACIO,
      idLaboratorio: this.laboratorioCalendario() ?? this.laboratorios()[0]?.idLaboratorio ?? 0,
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
