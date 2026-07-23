import { TestBed } from '@angular/core/testing';

import { WebDevTecService } from './web-dev-tec.service';

describe('WebDevTecService', () => {
  let service: WebDevTecService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebDevTecService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return an array of more than 5 technologies', () => {
    const data = service.getTec();

    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBeGreaterThan(5);
    expect(typeof data[0]).toBe('object');
  });

  it('should give every entry a title, url, description and icon', () => {
    const data = service.getTec();

    for (const tech of data) {
      expect(tech.title).toBeTruthy();
      expect(tech.url).toMatch(/^https?:\/\//);
      expect(tech.description).toBeTruthy();
      expect(tech.icon).toMatch(/^bi-/);
    }
  });
});
