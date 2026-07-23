import { Injectable } from '@angular/core';

export interface Tech {
  title: string;
  url: string;
  description: string;
  icon: string;
}

const TECH_STACK: Tech[] = [
  {
    title: 'Angular',
    url: 'https://angular.dev/',
    description: 'Platform for building mobile and desktop web applications.',
    icon: 'bi-lightning-charge'
  },
  {
    title: 'TypeScript',
    url: 'https://www.typescriptlang.org/',
    description: 'Typed superset of JavaScript that compiles to plain JavaScript.',
    icon: 'bi-code-slash'
  },
  {
    title: 'RxJS',
    url: 'https://rxjs.dev/',
    description: 'Reactive Extensions Library for composing asynchronous, event-based programs.',
    icon: 'bi-arrow-repeat'
  },
  {
    title: 'Bootstrap',
    url: 'https://getbootstrap.com/',
    description: 'The most popular HTML, CSS, and JS library for building responsive, mobile-first sites.',
    icon: 'bi-bootstrap'
  },
  {
    title: 'ngx-toastr',
    url: 'https://www.npmjs.com/package/ngx-toastr',
    description: 'Toastr notifications, rewritten for Angular with no jQuery dependency.',
    icon: 'bi-bell'
  },
  {
    title: 'Vitest',
    url: 'https://vitest.dev/',
    description: 'Fast unit test framework powered by Vite, used by the Angular CLI test builder.',
    icon: 'bi-check2-circle'
  }
];

@Injectable({ providedIn: 'root' })
export class WebDevTecService {
  getTec(): Tech[] {
    return TECH_STACK;
  }
}
