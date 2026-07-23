import { Component, VERSION, inject, signal } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { Typewriter } from '../../components/typewriter/typewriter';
import { GithubContributorService } from '../../services/github-contributor.service';
import { Tech, WebDevTecService } from '../../services/web-dev-tec.service';

function shuffled<T>(items: T[]): T[] {
  return items
    .map((item) => ({ item, rank: Math.random() }))
    .sort((a, b) => a.rank - b.rank)
    .map(({ item }) => item);
}

@Component({
  selector: 'app-home',
  imports: [Typewriter],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  private readonly webDevTec = inject(WebDevTecService);
  private readonly githubContributor = inject(GithubContributorService);
  private readonly toastr = inject(ToastrService);

  readonly angularVersion = VERSION.full;
  readonly classAnimation = signal('');
  readonly awesomeThings = signal<Tech[]>(shuffled(this.webDevTec.getTec()));
  readonly typewriterWords = signal<string[]>(['Angular', 'TypeScript', 'Bootstrap']);

  constructor() {
    this.githubContributor.getContributors(10).subscribe((contributors) => {
      this.typewriterWords.update((words) => [...words, ...contributors.map((c) => c.login)]);
    });

    setTimeout(() => this.classAnimation.set('animate__rubberBand'), 4000);
  }

  showToastr(): void {
    this.toastr.info(
      `Migrated from AngularJS to <b>Angular ${this.angularVersion}</b> with <b>Bootstrap 5</b>.`
    );
    this.classAnimation.set('');
  }
}
