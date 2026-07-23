import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { EstadoLaboratorio, Laboratorio } from '../../models/laboratorio.model';
import { LaboratorioService } from '../../services/laboratorio.service';

interface LaboratorioConEstado {
  laboratorio: Laboratorio;
  estado: EstadoLaboratorio | null;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  private readonly laboratorioService = inject(LaboratorioService);

  readonly laboratorios = signal<LaboratorioConEstado[]>([]);
  readonly cargando = signal(true);
  readonly error = signal(false);

  constructor() {
    this.laboratorioService.getAll().subscribe({
      next: (laboratorios) => this.cargarEstados(laboratorios),
      error: () => {
        this.cargando.set(false);
        this.error.set(true);
      }
    });
  }

  private cargarEstados(laboratorios: Laboratorio[]): void {
    if (laboratorios.length === 0) {
      this.cargando.set(false);
      return;
    }

    const estados$ = laboratorios.map((laboratorio) =>
      this.laboratorioService
        .getUltimoEstado(laboratorio.idLaboratorio as number)
        .pipe(catchError(() => of(null)))
    );

    forkJoin(estados$).subscribe((estados) => {
      this.laboratorios.set(laboratorios.map((laboratorio, index) => ({ laboratorio, estado: estados[index] })));
      this.cargando.set(false);
    });
  }
}
