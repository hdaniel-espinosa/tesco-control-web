import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Usuario } from '../models/usuario.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/usuarios`;

  getAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.baseUrl);
  }

  getById(idUsuario: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/${idUsuario}`);
  }

  create(usuario: Usuario): Observable<string> {
    return this.http.post(this.baseUrl, usuario, { responseType: 'text' });
  }

  update(idUsuario: number, usuario: Usuario): Observable<string> {
    return this.http.put(`${this.baseUrl}/${idUsuario}`, usuario, { responseType: 'text' });
  }

  delete(idUsuario: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${idUsuario}`, { responseType: 'text' });
  }
}
