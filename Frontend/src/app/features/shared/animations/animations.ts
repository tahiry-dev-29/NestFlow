import { animate, group, query, style, transition, trigger } from '@angular/animations';

export const moveActiveBar = trigger('moveActiveBar', [
  transition('* => *', [
    query('.active-indicator', style({ transform: 'translateX({{ start }}px)' }), { optional: true }),
    group([
      query(
        '.active-indicator',
        animate('300ms ease', style({ transform: 'translateX({{ end }}px)' })),
        { optional: true }
      ),
    ]),
  ]),
]);

export const expandCollapse = trigger('expandCollapse', [
  transition(':enter', [
    style({ transform: 'translateY(-40px)', opacity: 0 }),
    animate(
      '300ms ease-out',
      style({ transform: 'translateY(0)', opacity: 1 })
    ),
  ]),
  transition(':leave', [
    animate(
      '500ms ease-in',
      style({ opacity: 0, transform: 'translateY(-20px)' })
    ),
  ]),
]);