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
import { switchMap, take, takeUntil } from 'rxjs/operators';
import { interval, Subject } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: [ './home.page.scss' ],
})
export class HomePage implements OnInit, AfterViewChecked, OnDestroy {

  @ViewChildren(IonCard, {read: ElementRef}) cards: QueryList<ElementRef>;

  foodData: Product[] = null;

  slideOps = {
    initialSlide: 1,
    autoplay: {
      delay: 1500,
    },
    allowTouchMove: false,
  };

  protected ngUnsubscribe = new Subject<void>();

  private cardsArray: ElementRef<any>[] = [];
  private oldProductsData: Product[] = [];
  private likedProducts: Product[] = [];
  private allChosenProducts: Product[] = [];

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
    this.commonService.getProducts();

    this.commonService.likedProducts.pipe(take(1))
      .subscribe((items) => this.likedProducts = items);

    // get liked products in prev session
    this.commonService.allChosenProducts.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(prods => {
        if (prods === null) {
          this.allChosenProducts = [];
          this.likedProducts = [];
          this.loadProducts();
          return;
        }
        if (prods.length === 0) {
          return;
        }
        this.allChosenProducts = prods;
      });

    // get products from api
    this.loadProducts();

    // interval for get every 5 sec products data
    interval(5000)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap(() => this.apiService.getAllFood()))
      .subscribe((data) => {
        if (JSON.stringify(data) !== JSON.stringify(this.oldProductsData)) {
          this.foodData = this.filterProducts(data);
          this.oldProductsData = data;
        }
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
      this.oldProductsData = foodArr;

      if (foodArr && foodArr.length > 0) {
        this.foodData = foodArr;

        if (this.allChosenProducts.length > 0) {
          this.foodData = this.filterProducts(foodArr);
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
        // or we can find item by id and delete then
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        isLike ? this.saveLikedProducts(this.foodData[this.foodData.length - 1])
          : this.saveAllProducts(this.foodData[this.foodData.length - 1]);
        this.foodData.pop();
      }, 800);

      return true;
    });
  }

  private filterProducts(products): Product[] {
    return products.filter(item => !this.allChosenProducts.some((p) => p.id === item.id));
  }

  private saveLikedProducts(lastCard: Product) {
    this.likedProducts.push(lastCard);
    this.commonService.saveProducts(this.likedProducts, 'liked');

    this.saveAllProducts(lastCard);
  }

  private saveAllProducts(lastCard: Product) {
    this.allChosenProducts.push(lastCard);
    this.commonService.saveProducts(this.allChosenProducts, 'allProducts');
  }
}
