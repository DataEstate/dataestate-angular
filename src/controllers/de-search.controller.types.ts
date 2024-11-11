export interface IDeSearchController {
  name: string;
  searchText: string;
  searchEstateOptions: any[];
  searchLocationOptions: any[];
  searchRegion: boolean | string;
  searchLocality: boolean | string;
  searchState: boolean | string;
  locationLabel: string;
  estateLabel: string;
  keywordLabel: string;
  estateUrl: string;
  searchModes: string[];
  searchParams: any;
  searchType: string;
  searchControl: any;

  setSearchControl(searchControl: any): void;
  searchChanged(newSearch: string, oldSearch: string): void;
  searchLocationClicked(location: any): void;
  searchKeywordClicked(): void;
}
