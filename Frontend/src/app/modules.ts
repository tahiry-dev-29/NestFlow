import { NgModule } from '@angular/core';
import { HidePasswordPipe } from './features/subscription/pipes/hide-password.pipe';

@NgModule({
  declarations: [HidePasswordPipe],
  exports: [HidePasswordPipe]
})
export class DirectiveModule {}