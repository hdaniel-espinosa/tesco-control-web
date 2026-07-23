import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';

export interface Contributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

@Injectable({ providedIn: 'root' })
export class GithubContributorService {
  private readonly http = inject(HttpClient);
  private readonly apiHost = 'https://api.github.com/repos/hdaniel-espinosa/tesco-control-web';

  getContributors(limit = 30): Observable<Contributor[]> {
    return this.http
      .get<Contributor[]>(`${this.apiHost}/contributors`, { params: { per_page: limit } })
      .pipe(
        catchError((error) => {
          console.error('XHR Failed for getContributors.', error);
          return of([]);
        })
      );
  }
}
