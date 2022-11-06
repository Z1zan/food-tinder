import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import { AlertController, Gesture, GestureController, IonCard, LoadingController, Platform } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { Product } from '../../interfaces/product';
import { CommonService } from '../../services/common.service';
import { takeUntil } from 'rxjs/operators';
import { interval, Subject } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: [ './home.page.scss' ],
})
export class HomePage implements OnInit, AfterViewChecked, OnDestroy {

  @ViewChildren(IonCard, {read: ElementRef}) cards: QueryList<ElementRef>;
  cardsArray: ElementRef<any>[] = [];
  foodData: Product[] = null;
  oldProducts: Product[] = null;

  likedProducts: Product[] = [];

  slideOps = {
    initialSlide: 1,
    autoplay: {
      delay: 1500,
    },
    allowTouchMove: false,
  };

  protected ngUnsubscribe = new Subject<void>();

  constructor(
    private gestureController: GestureController,
    private platform: Platform,
    private apiService: ApiService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private cd: ChangeDetectorRef,
    private commonService: CommonService,
  ) {
  }

  ngOnInit(): void {
    this.commonService.getLikedProducts();
    // get products from api
    this.loadProducts();

    // get liked products in prev session
    this.commonService.likedProducts.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(prods => {
        if (prods === null) {
          this.loadProducts();
          this.likedProducts = [];
          return;
        }
        if (prods.length === 0) {
          return;
        }
        this.likedProducts = prods;
      });

    // interval for get every 5 sec products data
    interval(5000)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(time => {
        this.apiService.getAllFood().subscribe(data => {
          if (time === 0) {
            this.oldProducts = data;
          }
          if (JSON.stringify(data) !== JSON.stringify(this.oldProducts)) {
            this.foodData = data;
          }
        });
      });
  }

  ngAfterViewChecked() {
    this.cardsArray = this.cards?.toArray();
    this.useSwipe(this.cardsArray);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
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

        if (this.likedProducts.length > 0) {
          // eslint-disable-next-line @typescript-eslint/prefer-for-of
          for (let i = 0; i < this.likedProducts.length; i++) {
            this.foodData = this.foodData.filter(item => item.id !== this.likedProducts[i].id);
          }
        }
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

  likeDislikeFood(card, isLike: boolean): void {
    const idElement: string = card && card?.nativeElement ? card.nativeElement.id : card.id;

    this.cardsArray.some((item) => {
      if (item.nativeElement.id !== idElement) {
        return false;
      }

      const operator = isLike ? '-' : '';
      item.nativeElement.style.transition = '.8s ease-out';
      item.nativeElement.style.transform =
        `translateX(${ operator + this.platform.width() * 2 }px) rotate(${ operator }60deg)`;

      setTimeout(() => {
        const lastCard = this.foodData.pop();   // or we can find item by id and delete then
        if (isLike) {
          this.likedProducts.push(lastCard);
          this.commonService.saveLikedProducts(this.likedProducts);
        }

        this.cd.detectChanges();
      }, 1000);

      return true;
    });
  }
}
