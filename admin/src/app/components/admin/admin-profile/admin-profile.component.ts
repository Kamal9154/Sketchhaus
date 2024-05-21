import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CropperSettings } from 'ngx-img-cropper';
import { ToastrService } from 'ngx-toastr';
import { ApiUrlService } from 'src/app/shared/services/api-url.service';
import { HttpService } from 'src/app/shared/services/http-service';
import { ValidationService } from 'src/app/shared/services/validation.service';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.scss']
})
export class AdminProfileComponent implements OnInit {

  data: any;
  admindata: any
  cropperSettings: CropperSettings;
  formBasic: FormGroup;
  loading: boolean;
  id;
  imgdata;
  showHidePass = true;
  submitted = false


  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private validation: ValidationService,
    private http: HttpService,
    private apiurl: ApiUrlService,
    private toaster: ToastrService,
    private router : Router

  ) {
    this.cropperSettings = new CropperSettings();
    this.cropperSettings.width = 100;
    this.cropperSettings.height = 100;
    this.cropperSettings.croppedWidth = 100;
    this.cropperSettings.croppedHeight = 100;
    this.cropperSettings.canvasWidth = 400;
    this.cropperSettings.canvasHeight = 300;
    this.cropperSettings.cropperDrawSettings.lineDash = true;
    this.cropperSettings.cropperDrawSettings.dragIconStrokeWidth = 0;

    this.id = localStorage.getItem('user_id');
    this.data = {}

  }

  async ngOnInit() {
    this.createform();
    this.admindata = await this.http.post(this.apiurl.url.getadminUserById, { id: this.id });
    if (this.admindata['message'] == 'Wrong authorization' || this.admindata['message'] == 'Session is expired please login again') {
    localStorage.clear()
      this.router.navigateByUrl("/sessions/signin")
      this.toaster.error(this.admindata['message'])
  }
    
    this.formBasic.patchValue({
      firstName: this.admindata?.['data']['first_name'],
      lastName: this.admindata?.['data']['last_name'],
      email: this.admindata?.['data']['email'],
      password: this.admindata?.['data']['password']
    }
    )
    this.data.image = this.admindata['data']['profile_img']
  }
  async createform() {
    this.formBasic = this.fb.group({
      firstName: ['', this.validation.name],
      lastName: ['', this.validation.name],
      email: ['', this.validation.email],
      password: ['', this.validation.password]
    })
  }
  open(modal) {
    this.modalService.open(modal, { ariaLabelledBy: 'modal-basic-title' })
      .result.then((result) => {
        
      }, (reason) => {
        console.log('Err!', reason);
      });
  }

  async submit() {
    if (this.formBasic.invalid) return
    const formData = new FormData
    

    formData.append("first_name", this.formBasic.value.firstName);
    formData.append("last_name", this.formBasic.value.lastName);
    formData.append("email", this.formBasic.value.email);
    formData.append("password", this.formBasic.value.password);
    if (this.imgdata) {
      formData.append("profile_img", this.imgdata);
    }
    formData.append("id", this.id);




    this.admindata = await this.http.post(this.apiurl.url.adminUpdate, formData);
    if (this.admindata['status'] == true) {
      this.toaster.success(this.admindata['message'])
    } else {
      this.toaster.error(this.admindata['message'])
    }
  }
  croppedImage : any
  imageCropped1(e: any) {
    // this.imgdata = e.target.files[0]
    this.croppedImage = e.target.files[0]
    
  }
  
  cancel(){
    this.imgdata  = ''
    this.data.image = this.admindata['data']['profile_img']
  }
  saveImage(){
    console.log(this.croppedImage,"saveImage")
    this.imgdata  = this.croppedImage

  }
  
  showHidePassword() {
    if (this.showHidePass) this.showHidePass = false
    else this.showHidePass = true
  };

}