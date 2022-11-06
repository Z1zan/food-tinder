import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import { AlertController, Gesture, GestureController, IonCard, LoadingController, Platform } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { Product } from '../../interfaces/product';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, AfterViewChecked {

  @ViewChildren(IonCard, { read: ElementRef }) cards: QueryList<ElementRef>;
  cardsArray: ElementRef<any>[] = [];
  foodData: Product[];

  constructor(
    private gestureController: GestureController,
    private platform: Platform,
    private apiService: ApiService,
    private loadingController: LoadingController,
    private alertController: AlertController,
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  ngAfterViewChecked() {
    this.cardsArray = this.cards?.toArray();
    this.useSwipe(this.cardsArray);
  }

  async loadProducts() {
    const loading = await this.loadingController.create({
      message: 'Please wait, loading products...',
    });
    await loading.present();

    this.apiService.getAllFood().subscribe((foodArr) => {
      loading.dismiss();
      if (foodArr && foodArr.length > 0) {
        this.foodData = foodArr;
      } else {
        this.showAlert();
      }
    });
  }

  async showAlert() {
    const alert = await this.alertController.create({
      message: 'sorry, but we haven\'t found any products',
      buttons: [
        { text: 'Okay' },
        { text: 'Try again', handler: () => this.loadProducts() }
      ]
    });
    await alert.present();
  }

  useSwipe(arr: ElementRef[]): void {
    for (const card of arr) {
      const gesture: Gesture = this.gestureController.create({
        el: card.nativeElement,
        gestureName: 'swipe',
        onMove: ev => {
          card.nativeElement.style.transform = `translateX(${ ev.deltaX }px) translateY(${ ev.deltaY }px) rotate(${ ev.deltaX / 10 }deg)`;
        },
        onEnd: ev => {
          card.nativeElement.style.transition = '.8s ease-out';
          if (ev.deltaX > 150) { // Dislike
            this.likeDislikeFood(card, false);
          } else if (ev.deltaX < -150) { // Like
            this.likeDislikeFood(card, true);
          } else {
            card.nativeElement.style.transition = '.3s ease-out';
            card.nativeElement.style.transform = '';
          }
        }
      }, true);
      gesture.enable(true);
    }
  }

  likeFood(card: ElementRef | any): void {
    const idElement = card && card?.nativeElement ? card.nativeElement.id : card.id;

    this.cardsArray.some((item) => {
      if (item.nativeElement.id != idElement) {
        return false;
      }
      item.nativeElement.style.transition = '.8s ease-out';
      item.nativeElement.style.transform = `translateX(-${+this.platform.width() * 2}px) rotate(90deg)`;
      return true;
    });
  }

  likeDislikeFood(card, isLike: boolean): void {
    const idElement = card && card?.nativeElement ? card.nativeElement.id : card.id;

    console.log('like is ', isLike);

    this.cardsArray.some((item) => {
      if (item.nativeElement.id != idElement) {
        return false;
      }

      const operator = isLike ? '-' : '';

      item.nativeElement.style.transition = '.8s ease-out';
      item.nativeElement.style.transform =
        `translateX(${ operator + this.platform.width() * 2 }px) rotate(${ operator }60deg)`;
      return true;
    });
  }
}
