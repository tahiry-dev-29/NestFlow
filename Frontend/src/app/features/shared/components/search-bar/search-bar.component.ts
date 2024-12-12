import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  standalone: true,
  imports: [FormsModule],
})
export class SearchBarComponent {
  search = output<string>();
  searchTerm = signal('');
  isLoading = signal(false); // État de chargement
  private timeout: any;

  onSearch() {
    this.isLoading.set(true); // Début de la recherche
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.search.emit(this.searchTerm());
      this.isLoading.set(false); // Fin de la recherche
    }, 300); // Simule un délai avant l'émission de l'événement
  }
}