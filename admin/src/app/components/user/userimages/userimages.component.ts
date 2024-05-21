import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route } from '@angular/router';
import { ViewChild, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { Gallery, GalleryItem, ImageItem, ThumbnailsPosition, ImageSize } from '@ngx-gallery/core';
import { Lightbox } from '@ngx-gallery/lightbox';
import { map } from 'rxjs/operators';
import { HttpService } from 'src/app/shared/services/http-service';
import { ApiUrlService } from 'src/app/shared/services/api-url.service';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-userimages',
  templateUrl: './userimages.component.html',
  styleUrls: ['./userimages.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class UserimagesComponent implements OnInit {

  items: GalleryItem[];
  deleteitemarray = []
  deleteitemnamearray = []
  imageData = [];
  routdata = this.activatedroute.snapshot.queryParams
  desabled = true
  showdtlbtn = false

  constructor(
    public gallery: Gallery,
    public lightbox: Lightbox,
    private activatedroute: ActivatedRoute,
    private http: HttpService,
    private apiurl: ApiUrlService,
    private cref: ChangeDetectorRef,
    private toaster: ToastrService,
    private modalService: NgbModal,

  ) {
    this.getuserimages()
  }

  ngOnInit() { }
  async getuserimages() {
    let result = await this.http.post(this.apiurl.url.getusreimagesbyfolder, { user_id: this.routdata.uId, folder_id: this.routdata.fId });
    this.imageData = result['data']
    this.cref.detectChanges()
  }
  getdeleteitemvalue(event: any, data: any) {
    console.log(data, "ddddd")
    if (event.target.checked) {
      this.deleteitemarray.push(data.image_id)
      this.deleteitemnamearray.push(data.img_name)

    }
    else {
      this.deleteitemarray = this.deleteitemarray.filter(e => e !== data.image_id)
      this.deleteitemnamearray = this.deleteitemnamearray.filter(e => e !== data.img_name)


    }
    if (this.deleteitemarray.length) {

      this.desabled = false
    }
    else {
      this.desabled = true
    }
  }
  async deleteselecteditem() {
    let result = await this.http.post(this.apiurl.url.deleteiamges, { img_name_arr: this.deleteitemnamearray, imgarr: this.deleteitemarray, user_id: this.routdata.uId, folder_id: this.routdata.fId });
    if (result['status'] == true) {
      this.toaster.success(result['message'])
    } else {
      this.toaster.error(result['message'])
    }
    this.deleteitemnamearray = []

    this.getuserimages()

  }
  deleteInvoice(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true })
      .result.then((result) => {
        this.deleteselecteditem();

      }, (reason) => {

      });
  }

  onselectdelete() {
    this.deleteitemnamearray = []
    this.desabled = true
    if (this.showdtlbtn == true) { this.showdtlbtn = false }
    else {
      this.showdtlbtn = true
    }
  }
}

