import {
  animate,
  group,
  query,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const moveActiveBar = trigger('moveActiveBar', [
  transition('* => *', [
    query(
      '.active-indicator',
      style({ transform: 'translateX({{ start }}px)' }),
      { optional: true }
    ),
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
      '250ms ease-out',
      style({ transform: 'translateY(0)', opacity: 1 })
    ),
  ]),
  transition(':leave', [
    animate(
      '300ms ease-in',
      style({ opacity: 0, transform: 'translateY(-20px)' })
    ),
  ]),
]);

export const slideInOut = trigger('slideInOut', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
      style({ transform: 'translateX(0)', opacity: 1 })
    ),
  ]),
  transition(':leave', [
    animate('300ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
      style({ transform: 'translateX(100%)', opacity: 0 })
    ),
  ]),
]);
export const fadeIn = trigger('slideInOut', [
  state('in', style({
    transform: 'translateX(0)',
    opacity: 1,
    width: '270px',
  })),
  state('out', style({
    transform: 'translateX(-270px)',
    opacity: 0,
    width: '0',
  })),
  transition('in <=> out', animate('200ms ease-in-out'))
]);