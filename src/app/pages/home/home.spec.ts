import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ToastrService, provideToastr } from 'ngx-toastr';

import { Home } from './home';
import { WebDevTecService } from '../../services/web-dev-tec.service';

describe('Home', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideToastr()]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be created', () => {
    const fixture = TestBed.createComponent(Home);
    expect(fixture.componentInstance).toBeTruthy();
    httpMock.expectOne(() => true).flush([]);
  });

  it('should set the rubberBand animation class after 4 seconds', () => {
    const fixture = TestBed.createComponent(Home);
    httpMock.expectOne(() => true).flush([]);

    expect(fixture.componentInstance.classAnimation()).toBe('');
    vi.advanceTimersByTime(4000);
    expect(fixture.componentInstance.classAnimation()).toBe('animate__rubberBand');
  });

  it('should show a toastr info message and reset the animation when showToastr() is invoked', () => {
    const fixture = TestBed.createComponent(Home);
    httpMock.expectOne(() => true).flush([]);
    vi.advanceTimersByTime(4000);

    const toastr = TestBed.inject(ToastrService);
    const infoSpy = vi.spyOn(toastr, 'info');

    fixture.componentInstance.showToastr();

    expect(infoSpy).toHaveBeenCalled();
    expect(fixture.componentInstance.classAnimation()).toBe('');
  });

  it('should load more than 5 awesome things from WebDevTecService', () => {
    const fixture = TestBed.createComponent(Home);
    httpMock.expectOne(() => true).flush([]);

    const webDevTec = TestBed.inject(WebDevTecService);
    expect(fixture.componentInstance.awesomeThings().length).toBe(webDevTec.getTec().length);
    expect(fixture.componentInstance.awesomeThings().length).toBeGreaterThan(5);
  });

  it('should append fetched contributor logins to the typewriter words', () => {
    const fixture = TestBed.createComponent(Home);
    const req = httpMock.expectOne(() => true);
    req.flush([{ login: 'octocat', avatar_url: '', html_url: '', contributions: 1 }]);

    expect(fixture.componentInstance.typewriterWords()).toContain('octocat');
  });
});
