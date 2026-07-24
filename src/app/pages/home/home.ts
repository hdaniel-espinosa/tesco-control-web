import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HorarioProximo } from '../../models/horario.model';
import { EstadoLaboratorio, Laboratorio, LaboratorioEstadoOcupacion } from '../../models/laboratorio.model';
import { DashboardService } from '../../services/dashboard.service';
import { LaboratorioService } from '../../services/laboratorio.service';

interface LaboratorioConEstado {
  laboratorio: Laboratorio;
  estado: EstadoLaboratorio | null;
  ocupacion: LaboratorioEstadoOcupacion | null;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  private readonly laboratorioService = inject(LaboratorioService);
  private readonly dashboardService = inject(DashboardService);

  readonly laboratorios = signal<LaboratorioConEstado[]>([]);
  readonly horariosProximos = signal<HorarioProximo[]>([]);
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

    this.dashboardService
      .getHorariosProximos()
      .pipe(catchError(() => of([])))
      .subscribe((horariosProximos) => this.horariosProximos.set(horariosProximos));
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

    forkJoin({
      estados: forkJoin(estados$),
      ocupacion: this.dashboardService.getEstadoLaboratorios().pipe(catchError(() => of([])))
    }).subscribe(({ estados, ocupacion }) => {
      const ocupacionPorId = new Map(ocupacion.map((item) => [item.idLaboratorio, item]));

      const combinados = laboratorios.map((laboratorio, index) => ({
        laboratorio,
        estado: estados[index],
        ocupacion: ocupacionPorId.get(laboratorio.idLaboratorio as number) ?? null
      }));

      combinados.sort((a, b) => {
        const ocupadoA = a.ocupacion?.ocupado ?? false;
        const ocupadoB = b.ocupacion?.ocupado ?? false;
        if (ocupadoA !== ocupadoB) {
          return ocupadoA ? -1 : 1;
        }
        return a.laboratorio.nombre.localeCompare(b.laboratorio.nombre);
      });

      this.laboratorios.set(combinados);
      this.cargando.set(false);
    });
  }
}
