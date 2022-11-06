import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent implements OnInit {

  public appPages = [
    { title: 'Home', url: '/', icon: 'heart' },
    { title: 'Like someone', url: '/', icon: 'heart' },
    { title: 'History', url: '/', icon: 'heart' },
    { title: 'Settings', url: '/', icon: 'heart' },
  ];

  constructor() { }

  ngOnInit() {}

}
