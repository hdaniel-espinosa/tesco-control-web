import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Registro } from '../models/registro.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RegistroService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/registros`;
  private readonly laboratoriosUrl = `${environment.apiUrl}/laboratorios`;
  private readonly tarjetasUrl = `${environment.apiUrl}/tarjetas`;

  getAll(): Observable<Registro[]> {
    return this.http.get<Registro[]>(this.baseUrl);
  }

  getPorLaboratorio(idLaboratorio: number): Observable<Registro[]> {
    return this.http.get<Registro[]>(`${this.laboratoriosUrl}/${idLaboratorio}/registros`);
  }

  getPorTarjeta(idTarjeta: string): Observable<Registro[]> {
    return this.http.get<Registro[]>(`${this.tarjetasUrl}/${idTarjeta}/registros`);
  }
}
