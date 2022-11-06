import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonService } from '../../services/common.service';
import { ModalController } from '@ionic/angular';
import { LikedListComponent } from '../liked-list/liked-list.component';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent implements OnInit {

  constructor(
    private commonService: CommonService,
    private modalController: ModalController,
  ) { }

  ngOnInit() {}

  resetLikedProducts() {
    this.commonService.resetLikedProducts();
  }

  async showLikedProducts() {
    const modal = await this.modalController.create({
      component: LikedListComponent,
    });
    await modal.present();
  }

}
