import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { LikedListComponent } from '../../components/liked-list/liked-list.component';


@NgModule({
  declarations: [
    HeaderComponent,
    LikedListComponent,
  ],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [
    HeaderComponent,
    LikedListComponent,
  ]
})
export class SharedModule { }
