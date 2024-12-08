import { trigger, state, style, transition, animate } from '@angular/animations';

export const fadeInOutAnimation = trigger('fadeInOut', [
  state('void', style({
    opacity: 0
  })),
  transition('void => *', [
    animate(300)
  ]),
  transition('* => void', [
    animate(300)
  ])
]);