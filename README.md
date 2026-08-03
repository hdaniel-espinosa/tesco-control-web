# Tesco Control Web

Aplicación Angular para el sistema de control de acceso a laboratorios de
cómputo del Tecnológico de Coacalco con tarjeta NFC: alta de maestros,
tarjetas, laboratorios, materias y horarios, dashboard de ocupación en vivo,
bitácora de accesos y un simulador del lector NFC para pruebas.

Backend complementario: [`tesco-control-api`](https://github.com/hdaniel-espinosa/tesco-control-api)
(debe estar corriendo para que la app funcione).

## Stack

- Angular 21 (standalone components, signals, control flow `@if`/`@for`)
- Bootstrap 5 + Bootstrap Icons
- ngx-toastr (notificaciones)
- Vitest (pruebas)

## Requisitos

- Node.js `^20.19.0 || ^22.12.0 || >=24.0.0`
- La API (`tesco-control-api`) corriendo en `http://localhost:48080` (ver
  `src/environments/environment.ts` para cambiar la URL).

## Puesta en marcha

```bash
npm install
npm start      # ng serve, http://localhost:4200
```

```bash
npm run build  # build de producción en dist/tesco-control-web
npm test       # pruebas unitarias (Vitest)
```

> `src/environments/environment.ts` apunta a `http://localhost:48080/tesco-control-api`
> (solo hay un `environment.ts`, sin `environment.prod.ts` ni `fileReplacements`
> configurados todavía). Antes de desplegar a producción hay que agregar el
> archivo de producción con la URL real de la API.

## Autenticación

El backend protege casi toda la API con HTTP Basic. `AuthService` valida
usuario/contraseña contra `GET /auth/me`; si responde `200`, guarda el header
`Authorization: Basic ...` ya calculado en `sessionStorage` (se pierde al
cerrar la pestaña) y lo reenvía en cada petición vía `authInterceptor`. Si el
backend responde `401` en cualquier momento, `authInterceptor` limpia la
sesión y redirige a `/login`. `authGuard` protege todas las rutas salvo
`/login`.

Con el usuario de ejemplo del backend: **`user` / `password`**.

## Páginas

| Ruta | Descripción |
|---|---|
| `/login` | Inicio de sesión. |
| `/` | Dashboard: estado de ocupación de cada laboratorio (ocupados primero) y horarios próximos a comenzar. |
| `/maestros` | Alta/edición/baja de maestros; asignar tarjeta NFC y materias; ver sus horarios asignados. |
| `/tarjetas` | Alta/edición/baja de tarjetas NFC. |
| `/laboratorios` | Alta/edición/baja de laboratorios. |
| `/materias` | Alta/edición/baja de materias, con el/los maestro(s) que las imparten. |
| `/horarios` | CRUD de horarios; selector de laboratorio con calendario semanal visual (clic en un espacio vacío da de alta un horario, clic en uno existente lo edita). |
| `/registros` | Bitácora de accesos (fecha, tarjeta, maestro, laboratorio, resultado), filtrable por laboratorio. |
| `/acceso` | Simulador del lector NFC: valida una tarjeta contra un laboratorio, con opción de fijar una fecha/hora simulada para probar horarios sin depender de la hora real. |

## Estructura

```
src/app/
  components/   # navbar
  guards/       # authGuard
  interceptors/ # authInterceptor
  models/       # interfaces TypeScript que reflejan los DTOs del backend
  pages/        # una carpeta por página (componente standalone + template)
  services/     # un servicio HTTP por recurso de la API
```
