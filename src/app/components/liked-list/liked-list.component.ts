import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { take } from 'rxjs/operators';
import { Product } from '../../interfaces/product';

@Component({
  selector: 'app-liked-list',
  templateUrl: './liked-list.component.html',
  styleUrls: ['./liked-list.component.scss'],
})
export class LikedListComponent implements OnInit {

  likedArr: Product[] = null;

  constructor(
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.commonService.likedProducts.pipe(take(1))
      .subscribe(data => this.likedArr = data);
  }

}
