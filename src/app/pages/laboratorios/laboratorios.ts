import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { Laboratorio } from '../../models/laboratorio.model';
import { LaboratorioService } from '../../services/laboratorio.service';

const LABORATORIO_VACIO: Laboratorio = { nombre: '', edificio: '', nLugares: 0 };

@Component({
  selector: 'app-laboratorios',
  imports: [FormsModule],
  templateUrl: './laboratorios.html'
})
export class Laboratorios {
  private readonly laboratorioService = inject(LaboratorioService);
  private readonly toastr = inject(ToastrService);

  readonly laboratorios = signal<Laboratorio[]>([]);
  readonly cargando = signal(true);
  readonly enEdicion = signal<Laboratorio | null>(null);

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.laboratorioService.getAll().subscribe({
      next: (laboratorios) => {
        this.laboratorios.set(laboratorios);
        this.cargando.set(false);
      },
      error: () => {
        this.toastr.error('No se pudieron cargar los laboratorios');
        this.cargando.set(false);
      }
    });
  }

  nuevo(): void {
    this.enEdicion.set({ ...LABORATORIO_VACIO });
  }

  editar(laboratorio: Laboratorio): void {
    this.enEdicion.set({ ...laboratorio });
  }

  cancelar(): void {
    this.enEdicion.set(null);
  }

  guardar(): void {
    const laboratorio = this.enEdicion();
    if (!laboratorio) {
      return;
    }

    const peticion = laboratorio.idLaboratorio
      ? this.laboratorioService.update(laboratorio.idLaboratorio, laboratorio)
      : this.laboratorioService.create(laboratorio);

    peticion.subscribe({
      next: (mensaje) => {
        this.toastr.success(mensaje);
        this.enEdicion.set(null);
        this.cargar();
      },
      error: () => this.toastr.error('No se pudo guardar el laboratorio')
    });
  }

  eliminar(laboratorio: Laboratorio): void {
    if (!laboratorio.idLaboratorio || !confirm(`¿Eliminar el laboratorio "${laboratorio.nombre}"?`)) {
      return;
    }

    this.laboratorioService.delete(laboratorio.idLaboratorio).subscribe({
      next: (mensaje) => {
        this.toastr.success(mensaje);
        this.cargar();
      },
      error: () => this.toastr.error('No se pudo eliminar el laboratorio')
    });
  }
}
