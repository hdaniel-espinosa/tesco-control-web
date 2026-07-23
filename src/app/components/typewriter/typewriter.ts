import { Component, OnDestroy, input, signal } from '@angular/core';

/**
 * Small dependency-free typewriter effect, replacing the unmaintained
 * `malarkey` library used by the original AngularJS directive. It cycles
 * forever through `words()`, typing and deleting each one in turn, and
 * naturally picks up new words if the input signal changes later (e.g.
 * once an async list of contributors has loaded).
 */
@Component({
  selector: 'app-typewriter',
  template: `<span class="typewriter">{{ display() }}<span class="typewriter-cursor">|</span></span>`,
  styleUrl: './typewriter.scss'
})
export class Typewriter implements OnDestroy {
  readonly words = input<string[]>([]);
  readonly typeSpeed = input(40);
  readonly deleteSpeed = input(40);
  readonly pauseDelay = input(800);

  protected readonly display = signal('');

  private timerId?: ReturnType<typeof setTimeout>;
  private wordIndex = 0;
  private charCount = 0;
  private phase: 'typing' | 'pausing' | 'deleting' = 'typing';

  constructor() {
    this.scheduleNext(this.pauseDelay());
  }

  ngOnDestroy(): void {
    clearTimeout(this.timerId);
  }

  private scheduleNext(delay: number): void {
    this.timerId = setTimeout(() => this.tick(), delay);
  }

  private tick(): void {
    const words = this.words();

    if (words.length === 0) {
      this.scheduleNext(this.pauseDelay());
      return;
    }

    const word = words[this.wordIndex % words.length];

    switch (this.phase) {
      case 'typing':
        this.charCount++;
        this.display.set(word.slice(0, this.charCount));

        if (this.charCount >= word.length) {
          this.phase = 'pausing';
          this.scheduleNext(this.pauseDelay());
        } else {
          this.scheduleNext(this.typeSpeed());
        }
        break;

      case 'pausing':
        this.phase = 'deleting';
        this.tick();
        break;

      case 'deleting':
        this.charCount--;
        this.display.set(word.slice(0, this.charCount));

        if (this.charCount <= 0) {
          this.phase = 'typing';
          this.wordIndex++;
        }
        this.scheduleNext(this.deleteSpeed());
        break;
    }
  }
}
