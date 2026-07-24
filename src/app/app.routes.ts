import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login)
  },
  { path: '', component: Home, canActivate: [authGuard] },
  {
    path: 'maestros',
    loadComponent: () => import('./pages/maestros/maestros').then((m) => m.Maestros),
    canActivate: [authGuard]
  },
  {
    path: 'tarjetas',
    loadComponent: () => import('./pages/tarjetas/tarjetas').then((m) => m.Tarjetas),
    canActivate: [authGuard]
  },
  {
    path: 'laboratorios',
    loadComponent: () => import('./pages/laboratorios/laboratorios').then((m) => m.Laboratorios),
    canActivate: [authGuard]
  },
  {
    path: 'materias',
    loadComponent: () => import('./pages/materias/materias').then((m) => m.Materias),
    canActivate: [authGuard]
  },
  {
    path: 'horarios',
    loadComponent: () => import('./pages/horarios/horarios').then((m) => m.Horarios),
    canActivate: [authGuard]
  },
  {
    path: 'registros',
    loadComponent: () => import('./pages/registros/registros').then((m) => m.Registros),
    canActivate: [authGuard]
  },
  {
    path: 'acceso',
    loadComponent: () => import('./pages/acceso/acceso').then((m) => m.Acceso),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '' }
];
