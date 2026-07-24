import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Materia } from '../../models/materia.model';
import { Usuario } from '../../models/usuario.model';
import { MateriaService } from '../../services/materia.service';

const MATERIA_VACIA: Materia = { nombre: '', grupo: '' };

@Component({
  selector: 'app-materias',
  imports: [FormsModule],
  templateUrl: './materias.html'
})
export class Materias {
  private readonly materiaService = inject(MateriaService);
  private readonly toastr = inject(ToastrService);

  readonly materias = signal<Materia[]>([]);
  readonly maestrosPorMateria = signal<Map<number, Usuario[]>>(new Map());
  readonly cargando = signal(true);
  readonly enEdicion = signal<Materia | null>(null);

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.materiaService.getAll().subscribe({
      next: (materias) => {
        this.materias.set(materias);
        this.cargarMaestros(materias);
      },
      error: () => {
        this.toastr.error('No se pudieron cargar las materias');
        this.cargando.set(false);
      }
    });
  }

  private cargarMaestros(materias: Materia[]): void {
    if (materias.length === 0) {
      this.maestrosPorMateria.set(new Map());
      this.cargando.set(false);
      return;
    }

    const maestros$ = materias.map((materia) =>
      this.materiaService.getMaestrosDeMateria(materia.idMateria as number).pipe(catchError(() => of([])))
    );

    forkJoin(maestros$).subscribe((maestros) => {
      this.maestrosPorMateria.set(
        new Map(materias.map((materia, index) => [materia.idMateria as number, maestros[index]]))
      );
      this.cargando.set(false);
    });
  }

  nombresMaestros(idMateria: number): string {
    const maestros = this.maestrosPorMateria().get(idMateria) ?? [];
    return maestros.length > 0
      ? maestros.map((maestro) => `${maestro.nombre} ${maestro.apPaterno}`).join(', ')
      : 'Sin maestro asignado';
  }

  nuevo(): void {
    this.enEdicion.set({ ...MATERIA_VACIA });
  }

  editar(materia: Materia): void {
    this.enEdicion.set({ ...materia });
  }

  cancelar(): void {
    this.enEdicion.set(null);
  }

  guardar(): void {
    const materia = this.enEdicion();
    if (!materia) {
      return;
    }

    const peticion = materia.idMateria
      ? this.materiaService.update(materia.idMateria, materia)
      : this.materiaService.create(materia);

    peticion.subscribe({
      next: (mensaje) => {
        this.toastr.success(mensaje);
        this.enEdicion.set(null);
        this.cargar();
      },
      error: () => this.toastr.error('No se pudo guardar la materia')
    });
  }

  eliminar(materia: Materia): void {
    if (!materia.idMateria || !confirm(`¿Eliminar la materia "${materia.nombre}"?`)) {
      return;
    }

    this.materiaService.delete(materia.idMateria).subscribe({
      next: (mensaje) => {
        this.toastr.success(mensaje);
        this.cargar();
      },
      error: () => this.toastr.error('No se pudo eliminar la materia')
    });
  }
}
