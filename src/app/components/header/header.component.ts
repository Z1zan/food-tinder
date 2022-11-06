import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  @Input() pageTitle = '';
  @Input() buttonBack = false;

  constructor(
    private modalController: ModalController,
  ) { }

  ngOnInit() {}

  cancelModal() {
    return this.modalController.dismiss();
  }

}
