import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideBarComponent } from "../side-bar/side-bar.component";
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-dashboard-overview',
  imports: [RouterOutlet, SideBarComponent, HeaderComponent],
  templateUrl: './dashboard-overview.component.html',
  styleUrl: './dashboard-overview.component.scss'
})
export class DashboardOverviewComponent {

}
