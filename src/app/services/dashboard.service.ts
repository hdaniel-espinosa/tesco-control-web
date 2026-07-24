import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { HorarioProximo } from '../models/horario.model';
import { LaboratorioEstadoOcupacion } from '../models/laboratorio.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/dashboard`;

  getEstadoLaboratorios(): Observable<LaboratorioEstadoOcupacion[]> {
    return this.http.get<LaboratorioEstadoOcupacion[]>(`${this.baseUrl}/laboratorios`);
  }

  getHorariosProximos(limite = 5): Observable<HorarioProximo[]> {
    return this.http.get<HorarioProximo[]>(`${this.baseUrl}/horarios-proximos`, {
      params: { limite }
    });
  }
}
