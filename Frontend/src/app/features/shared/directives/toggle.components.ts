// import { Component, Input, OnInit } from '@angular/core';
// import { trigger, state, style, transition, animate } from '@angular/animations';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-example',
//   standalone: true,
//   imports: [CommonModule],
//   animations: [
//     trigger('fadeInOut', [
//       state('void', style({ opacity: 0 })),
//       transition(':enter', [animate('300ms ease-in-out', style({ opacity: 1 }))]),
//       transition(':leave', [animate('300ms ease-in-out', style({ opacity: 0 }))]),
//     ]),
//   ],
//   template: `
//     <button (click)="toggle('exampleKey1')">Toggle Primary</button>
//     <div *ngIf="isActive('exampleKey1')" [@fadeInOut]>
//       <p>Contenu visible pour ExampleKey1 (activé au départ).</p>
//     </div>
//     <br />

//     <button (click)="toggle('exampleKey2')">Toggle Secondary</button>
//     <div *ngIf="isActive('exampleKey2')" [@fadeInOut]>
//       <p>Contenu visible pour ExampleKey2 (désactivé au départ).</p>
//     </div>
//     <br />
//     <button (click)="toggle('exampleKey3')">Toggle Custom</button>
//     <div *ngIf="isActive('exampleKey3')" [@fadeInOut]>
//       <p>Contenu visible pour ExampleKey3 (activé au départ).</p>
//     </div>
//   `,
//   styles: [
//     `
//       button {
//         padding: 10px 20px;
//         background-color: #4caf50;
//         color: white;
//         border: none;
//         cursor: pointer;
//         border-radius: 4px;
//         font-size: 16px;
//         transition: background-color 0.3s;
//       }
//       button:hover {
//         background-color: #45a049;
//       }

//       div {
//         padding: 20px;
//         margin-top: 20px;
//         background-color: #f9f9f9;
//         border-radius: 4px;
//         box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
//       }
//     `,
//   ],
// })
// export class ExampleComponent implements OnInit {
//   @Input() initialStates: { [key: string]: boolean } = {
//     exampleKey1: true,
//     exampleKey2: false,
//     exampleKey3: true,
//   };

//   activeKeys: { [key: string]: boolean } = {};

//   ngOnInit() {
//     this.activeKeys = { ...this.initialStates };
//   }

//   toggle(key: string) {
//     this.activeKeys[key] = !this.activeKeys[key];
//   }

//   isActive(key: string) {
//     return this.activeKeys[key];
//   }
// }
