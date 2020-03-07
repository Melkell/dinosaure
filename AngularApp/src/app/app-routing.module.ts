import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DinoComponent } from './dino/dino.component';
import { LoginPageComponent } from './login-page/login-page.component';


const routes: Routes = [
  {path: '', redirectTo:"/contact", pathMatch: 'full'},
  {path: 'contact', component: DinoComponent},
  {path: 'login', component: LoginPageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
