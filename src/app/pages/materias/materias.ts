import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { Materia } from '../../models/materia.model';
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
        this.cargando.set(false);
      },
      error: () => {
        this.toastr.error('No se pudieron cargar las materias');
        this.cargando.set(false);
      }
    });
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
