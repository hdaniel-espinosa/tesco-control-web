import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Contributor, GithubContributorService } from './github-contributor.service';

describe('GithubContributorService', () => {
  let service: GithubContributorService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(GithubContributorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request the configured number of contributors', () => {
    let result: Contributor[] | undefined;

    service.getContributors(1).subscribe((data) => (result = data));

    const req = httpMock.expectOne(
      (request) =>
        request.url ===
          'https://api.github.com/repos/hdaniel-espinosa/tesco-control-web/contributors' &&
        request.params.get('per_page') === '1'
    );
    req.flush([{ login: 'octocat', avatar_url: '', html_url: '', contributions: 10 }]);

    expect(result?.length).toBe(1);
    expect(result?.[0].login).toBe('octocat');
  });

  it('should default the limit to 30', () => {
    service.getContributors().subscribe();

    const req = httpMock.expectOne((request) => request.params.get('per_page') === '30');
    req.flush([]);
  });

  it('should recover with an empty array on request failure', () => {
    let result: Contributor[] | undefined;

    service.getContributors(1).subscribe((data) => (result = data));

    const req = httpMock.expectOne(() => true);
    req.flush('error', { status: 500, statusText: 'Server Error' });

    expect(result).toEqual([]);
  });
});
