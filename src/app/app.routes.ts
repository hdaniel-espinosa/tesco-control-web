import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: '', component: Home },
  {
    path: 'maestros',
    loadComponent: () => import('./pages/maestros/maestros').then((m) => m.Maestros)
  },
  {
    path: 'tarjetas',
    loadComponent: () => import('./pages/tarjetas/tarjetas').then((m) => m.Tarjetas)
  },
  {
    path: 'laboratorios',
    loadComponent: () => import('./pages/laboratorios/laboratorios').then((m) => m.Laboratorios)
  },
  {
    path: 'materias',
    loadComponent: () => import('./pages/materias/materias').then((m) => m.Materias)
  },
  {
    path: 'horarios',
    loadComponent: () => import('./pages/horarios/horarios').then((m) => m.Horarios)
  },
  {
    path: 'registros',
    loadComponent: () => import('./pages/registros/registros').then((m) => m.Registros)
  },
  {
    path: 'acceso',
    loadComponent: () => import('./pages/acceso/acceso').then((m) => m.Acceso)
  },
  { path: '**', redirectTo: '' }
];
