import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Horario, HorarioDetalle } from '../models/horario.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HorarioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/horarios`;
  private readonly usuariosUrl = `${environment.apiUrl}/usuarios`;

  getAll(): Observable<Horario[]> {
    return this.http.get<Horario[]>(this.baseUrl);
  }

  getDeUsuario(idUsuario: number): Observable<HorarioDetalle[]> {
    return this.http.get<HorarioDetalle[]>(`${this.usuariosUrl}/${idUsuario}/horarios`);
  }

  create(horario: Horario): Observable<string> {
    return this.http.post(this.baseUrl, horario, { responseType: 'text' });
  }

  update(idHorario: number, horario: Horario): Observable<string> {
    return this.http.put(`${this.baseUrl}/${idHorario}`, horario, { responseType: 'text' });
  }

  delete(idHorario: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${idHorario}`, { responseType: 'text' });
  }
}
