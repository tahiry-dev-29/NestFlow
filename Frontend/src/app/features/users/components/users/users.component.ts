import { Component } from '@angular/core';
import { TableComponent } from "../table/table.component";

@Component({
  selector: 'app-users',
  imports: [TableComponent],
  standalone: true,
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {

}
