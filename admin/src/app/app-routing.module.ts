import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthLayoutComponent } from './shared/components/layouts/auth-layout/auth-layout.component';
import { AuthGaurd } from './shared/services/auth.gaurd';
import { BlankLayoutComponent } from './shared/components/layouts/blank-layout/blank-layout.component';
import { AdminLayoutSidebarLargeComponent } from './shared/components/layouts/admin-layout-sidebar-large/admin-layout-sidebar-large.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UserListComponent } from './components/user/user-list/user-list.component';
import { UserViewComponent } from './components/user/user-view/user-view.component';
import { UserimagesComponent } from './components/user/userimages/userimages.component';
import { AdminProfileComponent } from './components/admin/admin-profile/admin-profile.component';
import { MatterportComponent } from './components/user/matterport/matterport.component';

const adminRoutes: Routes = [


  {
    path: 'userlist', component: UserListComponent
  },
  {
    path: 'view/:id', component:UserViewComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGaurd],
  },
  {
    path: 'view-image',
    component: UserimagesComponent
  },
  {
    path: 'matterport',
    component: MatterportComponent
  },
  {
    path: 'profile',
    component: AdminProfileComponent
  }, 
  {
    path: '',
    component: BlankLayoutComponent,
    children: [
      {
        path: 'others',
        loadChildren: () => import('./views/others/others.module').then(m => m.OthersModule)
      }
    ]
  },
];

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'sessions',
        loadChildren: () => import('./views/sessions/sessions.module').then(m => m.SessionsModule)
      }
    ]
  },
  {
    path: '',
    component: AdminLayoutSidebarLargeComponent,
    canActivate: [AuthGaurd],
    children: adminRoutes
  },
  {
    path: '**',
    redirectTo: 'others/404'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
