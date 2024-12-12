export interface MenuItem {
  label: string;
  route: string;
  icon: string;
  dropdown: boolean;
  style?: 'settings' | 'primary'; // Types limités pour "style"
  children?: { label: string; route: string }[]; // Enfants (facultatifs)
}