import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IUsers } from '../../store/users.store';
import { ImageUrl } from '../../../../../../public/images/constant.images';

@Component({
  selector: 'app-view-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-user.component.html',
  styleUrl: './view-user.component.scss'
})
export class ViewUserComponent {
  readonly defaultImages = ImageUrl.defaultImages;
  @Input() user: IUsers | null = null;
}