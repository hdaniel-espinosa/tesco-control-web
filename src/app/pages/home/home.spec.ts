import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Home } from './home';

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

    httpMock.expectOne(() => true).flush([]);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.laboratorios().length).toBe(0);
    expect(fixture.componentInstance.cargando()).toBe(false);
  });

  it('should load laboratorios and their latest estado', () => {
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();

    httpMock
      .expectOne(() => true)
      .flush([{ idLaboratorio: 1, nombre: 'Lab A', edificio: 'B1', nLugares: 20 }]);

    httpMock.expectOne(() => true).flush({ idEstado: 1, idLaboratorio: 1, temperatura: 22, humedad: 45 });
    fixture.detectChanges();

    expect(fixture.componentInstance.laboratorios().length).toBe(1);
    expect(fixture.componentInstance.laboratorios()[0].estado?.temperatura).toBe(22);
  });

  it('should show an error state when the laboratorios request fails', () => {
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();

    httpMock.expectOne(() => true).flush('boom', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(fixture.componentInstance.error()).toBe(true);
  });
});
