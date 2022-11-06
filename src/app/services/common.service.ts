import { Injectable } from '@angular/core';
import { Product } from '../interfaces/product';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  public likedProducts = new BehaviorSubject<Product[]>([]);

  constructor() { }

  saveLikedProducts(products: Product[]): void {
    this.likedProducts.next(products);
    localStorage.setItem('liked', JSON.stringify(products));
  }

  getLikedProducts(): void {
    const likedProducts = JSON.parse(localStorage.getItem('liked'));
    this.likedProducts.next(likedProducts);
  }

  resetLikedProducts(): void {
    this.likedProducts.next(null);
    localStorage.removeItem('liked');
  }
}
