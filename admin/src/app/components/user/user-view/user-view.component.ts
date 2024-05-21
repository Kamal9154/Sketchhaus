import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiUrlService } from 'src/app/shared/services/api-url.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { HttpService } from 'src/app/shared/services/http-service';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms'; //imports
import { ToastrService } from 'ngx-toastr';
import { ValidationService } from 'src/app/shared/services/validation.service';
import * as moment from 'moment';

@Component({
  selector: 'app-user-view',
  templateUrl: './user-view.component.html',
  styleUrls: ['./user-view.component.scss']
})
export class UserViewComponent implements OnInit {


  token = localStorage.getItem('Token')
  id: any;
  userData;

  userfolder: any
  matterportfolder: any
  userpdf: any
  progress: any;
  file: any = new FormControl()
  filedata: any = [];
  notificationFormGroup: any
  showbtn: boolean = true
  submitted = false
  deletefolderarray = []
  desabled = true
  deletepdfarray = []
  deletepdfnamearray = []
  showdltbtn = false
  showdltbtnpdf = false

  constructor(
    private route: ActivatedRoute,
    private http: HttpService,
    private apiurl: ApiUrlService,
    private modalService: NgbModal,
    private toaster: ToastrService,
    private fb: FormBuilder,
    private validation: ValidationService
  ) {
    this.id = this.route.snapshot.params.id
  }


  ngOnInit(): void {
    this.notificationFormGroup = this.fb.group({
      msgtitle: ['', this.validation.msgTitle],
      msgbody: ['', this.validation.msgBody],
    })
    // this.auth.checkAuth1(this.page, this.id);
    this.getuserbyid();
    this.getuserfolders();
    this.getuserpdffiles();
  }
  async getuserbyid() {
    let result = await this.http.post(this.apiurl.url.getUserById, { id: this.id });
    this.userData = result['data']
    if(this.userData.matterport_folder_id){
    let result = await this.http.post(this.apiurl.url.getMatterportFolder, { id: this.userData.matterport_folder_id });
    let matterportData:any;
    matterportData = result
      let folderData = {
        video_count: matterportData.data.models.totalResults,
        folder_name: matterportData.data.name
      }
      this.matterportfolder = folderData;

    }
  }
  open(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' })

  }
  notificationpopup(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then((result) => { }, (reason) => {

        this.submitted = false
        this.notificationFormGroup.reset();
        this.modalService.dismissAll();
      })

  }
  async onsend() {

    if (!this.filedata.length) return this.toaster.error('pdf file is required')

    if (this.filedata[0].type.split("/")[1] != 'pdf') {
      return this.toaster.warning('Only PDF is allowed')
    }
    // return

    let formData = new FormData();

    formData.append('device_token', this.userData['device_token']);
    formData.append('device_type', this.userData['device_type']);
    formData.append('user_id', this.id);
    formData.append('name', this.userData.name);
    formData.append('email', this.userData.email);
    formData.append('file', this.filedata[0]);
    formData.append('created_at', moment().format('YYYY-MM-DD HH-mm-ss'));

    let result2 = await this.http.post(this.apiurl.url.uploadpdf, formData);

    if (result2['status']) {
      this.toaster.success(result2['message'])
    }
    else {
      this.toaster.error(result2['message'])
    }
    this.getuserpdffiles()
    this.file.reset();
  }
  upload(f: any) {
    this.filedata = f

    if (this.filedata[0].type.split("/")[1] != 'pdf') {
      this.filedata = []
      this.file.reset();
      return this.toaster.warning('Only PDF is allowed')
    }
    else {
      this.showbtn = false
    }
  }

  onselect(e: any) {
    this.progress = e.target.value;

  }
  async onsubmit() {
    if (!this.progress) return
    let obj = {
      id: this.id,
      progress_status: this.progress,
      device_token: this.userData['device_token'],
      device_type: this.userData['device_type'],
      created_at: moment().format('YYYY-MM-DD HH-mm-ss')

    }
    let result2 = await this.http.post(this.apiurl.url.changeproress, obj);

    if (result2['status']) {
      this.getuserbyid();

      this.toaster.success(result2['message'])
    }
    else {
      this.toaster.error(result2['message'])

    }
    this.progress = ''
  }
  async getuserfolders() {
    let result = await this.http.post(this.apiurl.url.getusrefolder, { user_id: this.id })

    this.userfolder = result['data']
  }



  async sendNotification() {
try {
  console.log('ddddddddddddddddddddddddddddd')
  // this.modalService.dismissAll()
  this.submitted = true
  console.log(this.notificationFormGroup.controls,'this.notificationFormGroup.invalid')
  if (this.notificationFormGroup.invalid) return
  let body = {
      msgbody: this.notificationFormGroup.value.msgbody,
      msgtitle: this.notificationFormGroup.value.msgtitle,
      created_at: moment().format('YYYY-MM-DD HH-mm-ss'),
      user_ids: [
        {
          id: this.id,
          device_token: this.userData['device_token'],
          device_type: this.userData['device_type']
        }
      ]
    }
    
    let result = await this.http.post(this.apiurl.url.sendNotification, body);
    if (result['status']) {
      this.toaster.success(result['message'], '', { timeOut: 2000 });

      this.submitted = false
      this.notificationFormGroup.reset();
      this.modalService.dismissAll();
      
    }
    else {
      this.toaster.error(result['message'], '', { timeOut: 2000 });
      
    }
  } catch (error) {
    console.log(error)
  }
    
  }
  async getuserpdffiles() {
    let result = await this.http.post(this.apiurl.url.getuserpdffiles, { user_id: this.id })
    this.userpdf = result['data']
  }
  
  /* delete folder starts */
  getdeletefoldervalue(event: any, data: any) {
    console.log('dddddddddddddddddddddddddddddddddddddddddddd')
    if (event.target.checked) {
      this.deletefolderarray.push(data.folder_id)
    }
    else {
      this.deletefolderarray = this.deletefolderarray.filter(e => e !== data.folder_id)
    }
    if (this.deletefolderarray.length) {
      
      this.desabled = false
    }
    else {
      this.desabled = true
    }
  }
  deleteInvoice(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true })
      .result.then((result) => {
        this.deleteselecteditem();

      }, (reason) => {

      });
  }
  async deleteselecteditem() {
    console.log(this.deletefolderarray, 'deletefolderarray')
    // return
    let result = await this.http.post(this.apiurl.url.deletefolders, { folder_id_arr: this.deletefolderarray, user_id: this.id });
    if (result['status'] == true) {
      this.toaster.success(result['message'])
    } else {
      this.toaster.error(result['message'])
    }
    this.deletefolderarray = []
    this.getuserfolders()
  }
  /* delete folder ends */

  /* delete pdf starts */
  getdeletepdfvalue(event: any, data: any) {
    console.log(data)
    if (event.target.checked) {
      this.deletepdfarray.push(data.id)
      this.deletepdfnamearray.push(data.name)
    }
    else {
      this.deletepdfarray = this.deletepdfarray.filter(e => e !== data.id)
      this.deletepdfnamearray = this.deletepdfnamearray.filter(e => e !== data.name)
    }
    console.log(this.deletepdfnamearray, "ddddddddddddd")
    console.log(this.deletepdfarray, "ddddddddddddd")
  }
  pdfdeleteInvoice(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true })
      .result.then((result) => {
        this.deleteselectedpdf();

      }, (reason) => {

      });
  }
  async deleteselectedpdf() {
    console.log(this.deletepdfarray, "fffffffffffffffff")
    // return
    let result = await this.http.post(this.apiurl.url.deletepdf, { pdf_id_arr: this.deletepdfarray, pdf_name_arr: this.deletepdfnamearray, user_id: this.id });
    if (result['status'] == true) {
      this.toaster.success(result['message'])
    } else {
      this.toaster.error(result['message'])
    }
    this.deletepdfarray = []
    this.getuserpdffiles()
  }
  /* delete pdf ends */


  onselectdelete() {
    this.deletefolderarray = []

    if (this.showdltbtn == true) { this.showdltbtn = false }
    else { this.showdltbtn = true }
  }
  onselectdeletepdf() {
    this.deletepdfarray = []
    if (this.showdltbtnpdf == true) { this.showdltbtnpdf = false }
    else { this.showdltbtnpdf = true }
  }

}
