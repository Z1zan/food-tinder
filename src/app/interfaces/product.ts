export interface Product {
  id: string;
  name: string;
  manufacturer: string;
  shortDescription: string;
  description: JSON;
  price: number;
  imageSet: ImageInfo[];
  isDigital: boolean;
  quantity: number;
}

interface ImageInfo {
  id: string;
  title: string;
  url: string;
}
