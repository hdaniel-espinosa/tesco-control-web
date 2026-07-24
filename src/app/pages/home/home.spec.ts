import { HttpRequest, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Home } from './home';

const esLaboratorios = (req: HttpRequest<unknown>) =>
  req.url.endsWith('/laboratorios') && !req.url.includes('/dashboard/');
const esHorariosProximos = (req: HttpRequest<unknown>) => req.url.includes('/dashboard/horarios-proximos');
const esEstadoOcupacion = (req: HttpRequest<unknown>) => req.url.endsWith('/dashboard/laboratorios');
const esEstadoSensor = (req: HttpRequest<unknown>) => /\/laboratorios\/\d+\/estado$/.test(req.url);

describe('Home', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created and show an empty state with no laboratorios', () => {
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();

    httpMock.expectOne(esLaboratorios).flush([]);
    httpMock.expectOne(esHorariosProximos).flush([]);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.laboratorios().length).toBe(0);
    expect(fixture.componentInstance.cargando()).toBe(false);
  });

  it('should load laboratorios, their latest estado and ocupación', () => {
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();

    httpMock
      .expectOne(esLaboratorios)
      .flush([{ idLaboratorio: 1, nombre: 'Lab A', edificio: 'B1', nLugares: 20 }]);
    httpMock.expectOne(esHorariosProximos).flush([]);

    httpMock.expectOne(esEstadoSensor).flush({ idEstado: 1, idLaboratorio: 1, temperatura: 22, humedad: 45 });
    httpMock.expectOne(esEstadoOcupacion).flush([
      {
        idLaboratorio: 1,
        nombreLaboratorio: 'Lab A',
        edificio: 'B1',
        nLugares: 20,
        ocupado: true,
        horarioActual: null,
        proximoHorario: null,
        minutosParaProximo: null
      }
    ]);
    fixture.detectChanges();

    expect(fixture.componentInstance.laboratorios().length).toBe(1);
    expect(fixture.componentInstance.laboratorios()[0].estado?.temperatura).toBe(22);
    expect(fixture.componentInstance.laboratorios()[0].ocupacion?.ocupado).toBe(true);
  });

  it('should show an error state when the laboratorios request fails', () => {
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();

    httpMock.expectOne(esLaboratorios).flush('boom', { status: 500, statusText: 'Server Error' });
    httpMock.expectOne(esHorariosProximos).flush([]);
    fixture.detectChanges();

    expect(fixture.componentInstance.error()).toBe(true);
  });
});
