import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TareaDetallesPage } from './tarea-detalles.page';

const routes: Routes = [
  {
    path: '',
    component: TareaDetallesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TareaDetallesPageRoutingModule {}
