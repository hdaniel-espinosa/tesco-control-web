import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Tarjeta } from '../models/tarjeta.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TarjetaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tarjetas`;
  private readonly usuariosUrl = `${environment.apiUrl}/usuarios`;

  getAll(): Observable<Tarjeta[]> {
    return this.http.get<Tarjeta[]>(this.baseUrl);
  }

  create(tarjeta: Tarjeta): Observable<string> {
    return this.http.post(this.baseUrl, tarjeta, { responseType: 'text' });
  }

  update(idTarjeta: string, tarjeta: Tarjeta): Observable<string> {
    return this.http.put(`${this.baseUrl}/${idTarjeta}`, tarjeta, { responseType: 'text' });
  }

  delete(idTarjeta: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${idTarjeta}`, { responseType: 'text' });
  }

  asignarAUsuario(idTarjeta: string, idUsuario: number): Observable<string> {
    return this.http.post(`${this.baseUrl}/${idTarjeta}/asignar/${idUsuario}`, null, { responseType: 'text' });
  }

  desasignar(idTarjeta: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${idTarjeta}/asignar`, { responseType: 'text' });
  }

  getTarjetasDeUsuario(idUsuario: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.usuariosUrl}/${idUsuario}/tarjetas`);
  }
}
