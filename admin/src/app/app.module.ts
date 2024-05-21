import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';

import { HttpClientModule } from '@angular/common/http';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UserListComponent } from './components/user/user-list/user-list.component';
// import { UserViewComponent } from './components/user/user-view/user-view.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatMenuModule } from '@angular/material/menu';
import { ReactiveFormsModule } from '@angular/forms';
import { UserViewComponent, } from './components/user/user-view/user-view.component';
import { UserimagesComponent } from './components/user/userimages/userimages.component';
import { LightboxModule } from '@ngx-gallery/lightbox';
import { GalleryModule } from '@ngx-gallery/core';
import { ImageViewerModule } from 'ngx-image-viewer';
import { GallerizeModule } from '@ngx-gallery/gallerize';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedComponentsModule } from './shared/components/shared-components.module';
import { CommonModule } from '@angular/common';
import { AdminProfileComponent } from './components/admin/admin-profile/admin-profile.component';
import { ImageCropperModule } from 'ngx-img-cropper';
// import { MatTableDataSource } from '@angular/material';
import { MatTableModule } from '@angular/material/table'  
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatterportComponent } from './components/user/matterport/matterport.component';



@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    UserListComponent,
    UserViewComponent,
    UserimagesComponent,
    AdminProfileComponent,
    MatterportComponent,
  ],
  imports: [
    BrowserModule,
    SharedModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgxDatatableModule,
    MatMenuModule,
    ReactiveFormsModule, 

    GalleryModule,
    LightboxModule,
    GallerizeModule,
    ImageViewerModule,
    
    NgxEchartsModule,
    NgbModule,
    SharedComponentsModule,
    CommonModule,
    ImageCropperModule,
    MatTableModule,
    MatPaginatorModule
    

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
