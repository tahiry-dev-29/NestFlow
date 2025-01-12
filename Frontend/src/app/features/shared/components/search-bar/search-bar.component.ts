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
  isLoading = signal(false);
  private timeout: any;

  onSearch() {
    this.isLoading.set(true);
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.search.emit(this.searchTerm());
      this.isLoading.set(false);
    }, 300);
  }
}