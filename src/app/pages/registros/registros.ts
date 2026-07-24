import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { Laboratorio } from '../../models/laboratorio.model';
import { Registro } from '../../models/registro.model';
import { LaboratorioService } from '../../services/laboratorio.service';
import { RegistroService } from '../../services/registro.service';

@Component({
  selector: 'app-registros',
  imports: [FormsModule, DatePipe],
  templateUrl: './registros.html'
})
export class Registros {
  private readonly registroService = inject(RegistroService);
  private readonly laboratorioService = inject(LaboratorioService);
  private readonly toastr = inject(ToastrService);

  readonly registros = signal<Registro[]>([]);
  readonly laboratorios = signal<Laboratorio[]>([]);
  readonly cargando = signal(true);
  readonly filtroLaboratorio = signal<number | null>(null);

  constructor() {
    this.laboratorioService.getAll().subscribe({
      next: (laboratorios) => this.laboratorios.set(laboratorios),
      error: () => this.toastr.error('No se pudieron cargar los laboratorios')
    });
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    const idLaboratorio = this.filtroLaboratorio();
    const peticion = idLaboratorio
      ? this.registroService.getPorLaboratorio(idLaboratorio)
      : this.registroService.getAll();

    peticion.subscribe({
      next: (registros) => {
        this.registros.set(registros);
        this.cargando.set(false);
      },
      error: () => {
        this.toastr.error('No se pudo cargar la bitácora de accesos');
        this.cargando.set(false);
      }
    });
  }

  onFiltroChange(valor: string): void {
    this.filtroLaboratorio.set(valor ? Number(valor) : null);
    this.cargar();
  }

  nombreLaboratorio(idLaboratorio: number): string {
    return this.laboratorios().find((laboratorio) => laboratorio.idLaboratorio === idLaboratorio)?.nombre
      ?? `#${idLaboratorio}`;
  }
}
