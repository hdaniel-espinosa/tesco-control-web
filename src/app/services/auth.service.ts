import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';

import { MeResponse } from '../models/auth.model';
import { environment } from '../../environments/environment';

const STORAGE_KEY = 'tesco-control-auth';

interface Sesion {
  username: string;
  authHeader: string;
}

/**
 * Autenticación vía HTTP Basic: el backend no maneja sesiones ni JWT, así
 * que aquí se guarda el header "Authorization" ya calculado (en
 * sessionStorage, se pierde al cerrar la pestaña) y se reenvía en cada
 * petición mediante authInterceptor.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly sesion = signal<Sesion | null>(this.leerSesionGuardada());

  readonly username = computed(() => this.sesion()?.username ?? null);
  readonly isAuthenticated = computed(() => this.sesion() !== null);

  login(usuario: string, contrasena: string): Observable<string> {
    const authHeader = `Basic ${btoa(`${usuario}:${contrasena}`)}`;

    return this.http
      .get<MeResponse>(`${environment.apiUrl}/auth/me`, { headers: { Authorization: authHeader } })
      .pipe(
        tap((respuesta) => this.guardarSesion({ username: respuesta.username, authHeader })),
        map((respuesta) => respuesta.username)
      );
  }

  logout(): void {
    this.sesion.set(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  getAuthHeader(): string | null {
    return this.sesion()?.authHeader ?? null;
  }

  private guardarSesion(sesion: Sesion): void {
    this.sesion.set(sesion);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sesion));
  }

  private leerSesionGuardada(): Sesion | null {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as Sesion;
    } catch {
      return null;
    }
  }
}
