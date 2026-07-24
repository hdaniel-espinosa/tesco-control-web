import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, throwError } from 'rxjs';

import { AccesoRequest, AccesoResponse } from '../models/acceso.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AccesoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/acceso`;

  /**
   * El backend responde 403 cuando el acceso se deniega, con el mismo
   * cuerpo AccesoResponse que en un acceso concedido (200). Angular trata
   * el 403 como error HTTP, así que aquí se recupera ese cuerpo para que
   * el llamador reciba siempre un AccesoResponse, sea acceso.acceso true o
   * false, y solo un error real de red/servidor llegue como error.
   */
  validar(request: AccesoRequest): Observable<AccesoResponse> {
    return this.http.post<AccesoResponse>(`${this.baseUrl}/validar`, request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 403 && error.error) {
          return of(error.error as AccesoResponse);
        }
        return throwError(() => error);
      })
    );
  }
}
