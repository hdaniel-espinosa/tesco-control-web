import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { AccesoResponse } from '../../models/acceso.model';
import { Laboratorio } from '../../models/laboratorio.model';
import { AccesoService } from '../../services/acceso.service';
import { LaboratorioService } from '../../services/laboratorio.service';

@Component({
  selector: 'app-acceso',
  imports: [FormsModule],
  templateUrl: './acceso.html'
})
export class Acceso {
  private readonly accesoService = inject(AccesoService);
  private readonly laboratorioService = inject(LaboratorioService);
  private readonly toastr = inject(ToastrService);

  readonly laboratorios = signal<Laboratorio[]>([]);
  readonly idTarjeta = signal('');
  readonly idLaboratorio = signal<number | null>(null);
  readonly usarHorarioSimulado = signal(false);
  readonly horarioSimulado = signal(this.horarioActualParaInput());
  readonly validando = signal(false);
  readonly resultado = signal<AccesoResponse | null>(null);

  constructor() {
    this.laboratorioService.getAll().subscribe({
      next: (laboratorios) => {
        this.laboratorios.set(laboratorios);
        this.idLaboratorio.set(laboratorios[0]?.idLaboratorio ?? null);
      },
      error: () => this.toastr.error('No se pudieron cargar los laboratorios')
    });
  }

  private horarioActualParaInput(): string {
    const ahora = new Date();
    ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
    return ahora.toISOString().slice(0, 16);
  }

  validar(): void {
    const idTarjeta = this.idTarjeta().trim();
    const idLaboratorio = this.idLaboratorio();
    if (!idTarjeta || !idLaboratorio) {
      return;
    }

    const fechaHoraSimulada = this.usarHorarioSimulado() && this.horarioSimulado()
      ? this.horarioSimulado()
      : undefined;

    this.validando.set(true);
    this.resultado.set(null);

    this.accesoService.validar({ idTarjeta, idLaboratorio, fechaHoraSimulada }).subscribe({
      next: (respuesta) => {
        this.resultado.set(respuesta);
        this.validando.set(false);
        if (respuesta.acceso) {
          this.toastr.success(respuesta.mensaje);
        } else {
          this.toastr.warning(respuesta.mensaje);
        }
      },
      error: () => {
        this.validando.set(false);
        this.toastr.error('No se pudo validar el acceso, revisa la conexión con la API');
      }
    });
  }
}
