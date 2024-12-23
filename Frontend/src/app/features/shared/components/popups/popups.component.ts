import { Component, output } from '@angular/core';
import { expandCollapse } from '../../animations/animations';

@Component({
  selector: 'app-popups',
  standalone: true,
  imports: [],
  templateUrl: './popups.component.html',
  styleUrl: './popups.component.scss',
  animations: [expandCollapse],
})
export class PopupsComponent {
  confirm = output();
  cancel = output();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }

}
