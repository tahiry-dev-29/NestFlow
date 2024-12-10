import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-not-found',
  imports: [],
  standalone: true,
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {

  private readonly location = inject(Location);

  navigateBack() {
    this.location.back();
  }
}