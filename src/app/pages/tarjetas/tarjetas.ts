import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { Tarjeta } from '../../models/tarjeta.model';
import { TarjetaService } from '../../services/tarjeta.service';

const TARJETA_VACIA: Tarjeta = { idTarjeta: '', tipo: 'NFC', activa: true };

@Component({
  selector: 'app-tarjetas',
  imports: [FormsModule],
  templateUrl: './tarjetas.html'
})
export class Tarjetas {
  private readonly tarjetaService = inject(TarjetaService);
  private readonly toastr = inject(ToastrService);

  readonly tarjetas = signal<Tarjeta[]>([]);
  readonly cargando = signal(true);
  readonly enEdicion = signal<Tarjeta | null>(null);
  readonly esNueva = signal(false);

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.tarjetaService.getAll().subscribe({
      next: (tarjetas) => {
        this.tarjetas.set(tarjetas);
        this.cargando.set(false);
      },
      error: () => {
        this.toastr.error('No se pudieron cargar las tarjetas');
        this.cargando.set(false);
      }
    });
  }

  nueva(): void {
    this.esNueva.set(true);
    this.enEdicion.set({ ...TARJETA_VACIA });
  }

  editar(tarjeta: Tarjeta): void {
    this.esNueva.set(false);
    this.enEdicion.set({ ...tarjeta });
  }

  cancelar(): void {
    this.enEdicion.set(null);
  }

  guardar(): void {
    const tarjeta = this.enEdicion();
    if (!tarjeta) {
      return;
    }

    const peticion = this.esNueva()
      ? this.tarjetaService.create(tarjeta)
      : this.tarjetaService.update(tarjeta.idTarjeta, tarjeta);

    peticion.subscribe({
      next: (mensaje) => {
        this.toastr.success(mensaje);
        this.enEdicion.set(null);
        this.cargar();
      },
      error: () => this.toastr.error('No se pudo guardar la tarjeta')
    });
  }

  eliminar(tarjeta: Tarjeta): void {
    if (!confirm(`¿Eliminar la tarjeta "${tarjeta.idTarjeta}"?`)) {
      return;
    }

    this.tarjetaService.delete(tarjeta.idTarjeta).subscribe({
      next: (mensaje) => {
        this.toastr.success(mensaje);
        this.cargar();
      },
      error: () => this.toastr.error('No se pudo eliminar la tarjeta')
    });
  }
}
