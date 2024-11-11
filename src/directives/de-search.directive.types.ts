import { IScope } from 'angular';

export interface IDeSearchScope extends IScope {
  locationLabel?: string;
  searchInState?: string;
  estateLabel?: string;
  keywordLabel?: string;
  estateUrl?: string;
  showState?: boolean;
  popupOpen: boolean;
  showKeywordSearch: boolean;
  showLocationSearch: boolean;
  showEstateSearch: boolean;
  searchControl: any; // Define a proper interface if possible
}
