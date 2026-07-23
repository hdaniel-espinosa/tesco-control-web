import { TestBed } from '@angular/core/testing';

import { Typewriter } from './typewriter';

describe('Typewriter', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({ imports: [Typewriter] }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be created', () => {
    const fixture = TestBed.createComponent(Typewriter);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should type the given word character by character', () => {
    const fixture = TestBed.createComponent(Typewriter);
    fixture.componentRef.setInput('words', ['Hi']);
    fixture.detectChanges();

    // initial pause, then two characters typed at 40ms each
    vi.advanceTimersByTime(800 + 40 + 40);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Hi');
  });

  it('should not throw while no words have been provided yet', () => {
    const fixture = TestBed.createComponent(Typewriter);
    fixture.detectChanges();

    expect(() => vi.advanceTimersByTime(5000)).not.toThrow();
  });
});
