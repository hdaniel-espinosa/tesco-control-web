import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Materia } from '../models/materia.model';
import { Usuario } from '../models/usuario.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MateriaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/materias`;
  private readonly usuariosUrl = `${environment.apiUrl}/usuarios`;

  getAll(): Observable<Materia[]> {
    return this.http.get<Materia[]>(this.baseUrl);
  }

  create(materia: Materia): Observable<string> {
    return this.http.post(this.baseUrl, materia, { responseType: 'text' });
  }

  update(idMateria: number, materia: Materia): Observable<string> {
    return this.http.put(`${this.baseUrl}/${idMateria}`, materia, { responseType: 'text' });
  }

  delete(idMateria: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${idMateria}`, { responseType: 'text' });
  }

  getMateriasDeUsuario(idUsuario: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.usuariosUrl}/${idUsuario}/materias`);
  }

  getMaestrosDeMateria(idMateria: number): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/${idMateria}/maestros`);
  }

  asignarAUsuario(idUsuario: number, idMateria: number): Observable<string> {
    return this.http.post(`${this.usuariosUrl}/${idUsuario}/materias/${idMateria}`, null, {
      responseType: 'text'
    });
  }

  desasignarDeUsuario(idUsuario: number, idMateria: number): Observable<string> {
    return this.http.delete(`${this.usuariosUrl}/${idUsuario}/materias/${idMateria}`, {
      responseType: 'text'
    });
  }
}
