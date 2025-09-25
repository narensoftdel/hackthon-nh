import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { DashboardComponent } from './dashboard.component';
import { FloorPlanComponent } from './floor-plan.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'floor-plan', component: FloorPlanComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
