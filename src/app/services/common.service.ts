import { Injectable } from '@angular/core';
import { Product } from '../interfaces/product';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  public likedProducts = new BehaviorSubject<Product[]>([]);
  public allChosenProducts = new BehaviorSubject<Product[]>([]);

  constructor() { }

  saveProducts(data: Product[], name: string): void {
    localStorage.setItem(name, JSON.stringify(data));
    if (name === 'liked') {
      this.likedProducts.next(data);
    } else {
      this.allChosenProducts.next(data);
    }
  }

  getProducts(): void {
    this.likedProducts.next(JSON.parse(localStorage.getItem('liked')));
    this.allChosenProducts.next(JSON.parse(localStorage.getItem('allProducts')));
  }

  resetProducts(): void {
    this.likedProducts.next([]);
    this.allChosenProducts.next(null);
    localStorage.removeItem('liked');
    localStorage.removeItem('allProducts');
  }
}
