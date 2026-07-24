import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { EstadoLaboratorio, Laboratorio } from '../models/laboratorio.model';
import { Horario } from '../models/horario.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LaboratorioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/laboratorios`;

  getAll(): Observable<Laboratorio[]> {
    return this.http.get<Laboratorio[]>(this.baseUrl);
  }

  getById(idLaboratorio: number): Observable<Laboratorio> {
    return this.http.get<Laboratorio>(`${this.baseUrl}/${idLaboratorio}`);
  }

  create(laboratorio: Laboratorio): Observable<string> {
    return this.http.post(this.baseUrl, laboratorio, { responseType: 'text' });
  }

  update(idLaboratorio: number, laboratorio: Laboratorio): Observable<string> {
    return this.http.put(`${this.baseUrl}/${idLaboratorio}`, laboratorio, { responseType: 'text' });
  }

  delete(idLaboratorio: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${idLaboratorio}`, { responseType: 'text' });
  }

  getUltimoEstado(idLaboratorio: number): Observable<EstadoLaboratorio> {
    return this.http.get<EstadoLaboratorio>(`${this.baseUrl}/${idLaboratorio}/estado`);
  }

  getHorarios(idLaboratorio: number): Observable<Horario[]> {
    return this.http.get<Horario[]>(`${this.baseUrl}/${idLaboratorio}/horarios`);
  }
}
