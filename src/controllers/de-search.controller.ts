import { IAugmentedJQuery } from 'angular';
import { IDeSearchScope } from '../directives/de-search.directive.types';
import { IDeSearchController } from './de-search.controller.types';
import { IDeEstatesService } from '../services/de-estates.service';
import { IDeLocationsService } from '../services/de-locations.service';

class DeSearchController implements IDeSearchController {
  static $inject = ['$scope', '$element', 'DeEstates', 'DeLocations'];

  name = '';
  searchText = '';
  searchEstateOptions: any[] = [];
  searchLocationOptions: any[] = [];
  searchRegion: boolean | string = false;
  searchLocality: boolean | string = false;
  searchState: boolean | string = false;
  locationLabel: string;
  estateLabel: string;
  keywordLabel: string;
  estateUrl: string;
  searchModes: string[] = [];
  searchParams: any = {};
  searchType = '';
  searchControl: any;

  private searchEstatePromise: angular.IPromise<any> | boolean = false;
  private searchLocationPromise: angular.IPromise<any> | boolean = false;

  constructor(
    private $scope: IDeSearchScope,
    private $element: IAugmentedJQuery,
    private DeEstates: IDeEstatesService,
    private DeLocations: IDeLocationsService
  ) {
    this.$onInit();
    this.$postLink();
  }

  $onInit() {
    const vm = this;

    // vm.name = this.$scope.name || '';
    vm.searchText = '';
    vm.searchEstateOptions = [];
    vm.searchLocationOptions = [];

    vm.searchRegion = false;
    vm.searchLocality = false;
    vm.searchState = false;

    this.$scope.popupOpen = false;
    this.$scope.showKeywordSearch = true;
    this.$scope.showLocationSearch = false;
    this.$scope.showEstateSearch = false;

    this.$scope.showState =
      this.$scope.showState === undefined ? true : this.$scope.showState;

    // Set defaults
    vm.locationLabel = this.$scope.locationLabel || 'Location';
    vm.estateLabel = this.$scope.estateLabel || 'Estate';
    vm.keywordLabel = this.$scope.keywordLabel || 'Keyword';
    vm.estateUrl = this.$scope.estateUrl || '/detail/';
  }

  $postLink() {
    const vm = this;

    // Decide which searches are available
    vm.searchModes = [];
    vm.searchParams = {};

    if (this.$scope.searchControl?.searchModes) {
      vm.searchModes = this.$scope.searchControl.searchModes.split('|');
    }

    if (this.$scope.searchControl?.defaultFilters) {
      vm.searchParams = this.$scope.searchControl.defaultFilters;
    }
  }

  setSearchControl(searchControl: any): void {
    this.$scope.searchControl = searchControl;
  }

  searchChanged(newSearch: string, oldSearch: string): void {
    const vm = this;
    vm.searchType = '';

    // Don't do search if empty or if there has been no changes. Clear everything
    if (newSearch === '') {
      vm.searchText = '';
      this.$scope.searchControl.searchText = ''; // Updates the child search bar.

      vm.searchLocality = false;
      vm.searchRegion = false;
      vm.searchState = false;
      return;
    }

    if (vm.searchText === newSearch) {
      return;
    }

    vm.searchText = newSearch;
    vm.searchType = vm.keywordLabel;
    this.$scope.popupOpen = true;

    if (vm.searchModes.length === 0 || vm.searchModes.includes('LOCATION')) {
      this.doLocationSearch();
    }
    if (vm.searchModes.length === 0 || vm.searchModes.includes('ESTATE')) {
      this.doEstateSearch();
    }
    if (vm.searchModes.length > 0 && !vm.searchModes.includes('KEYWORD')) {
      this.$scope.showKeywordSearch = false;
      vm.searchType = '';
    }
  }

  private doEstateSearch() {
    const vm = this;

    // Setup search estates
    vm.searchParams.name = vm.searchText;
    if (!vm.searchParams.fields) {
      vm.searchParams.fields = 'id,name';
    }
    if (!vm.searchParams.size) {
      vm.searchParams.size = 5;
    }

    this.searchEstatePromise = this.DeEstates.data(vm.searchParams)
      .then((response: any) => {
        this.searchEstatePromise = false;
        vm.searchEstateOptions = response.data
          .slice(0, 5)
          .map((estate: any) => ({
            label: estate.name,
            estateId: estate.id,
          }));
        this.$scope.showEstateSearch = true;
      })
      .catch((error: any) => {
        console.error(error);
      });
  }

  private doLocationSearch() {
    const vm = this;

    this.$scope.searchControl.searchLocality = false;
    this.$scope.searchControl.searchRegion = false;
    this.$scope.searchControl.searchState = false;

    // Setup search locations
    const locationSearchParams: any = {
      name: vm.searchText,
      fields: 'id,name,state_code,type',
      types: 'LOCALITY,REGION,STATE',
    };

    if (this.$scope.searchInState) {
      locationSearchParams.states = this.$scope.searchInState;
    }

    this.searchLocationPromise = this.DeLocations.data(
      locationSearchParams,
      'data'
    )
      .then((response: any) => {
        this.searchLocationPromise = false;

        // Prioritize results
        const compareSearch = response.config.params.name.toLowerCase();
        response.data.forEach((row: any) => {
          const compareResult = row.name.toLowerCase();
          row.priority =
            compareResult === compareSearch
              ? 1
              : compareResult.startsWith(compareSearch)
              ? 2
              : 3;
        });

        response.data.sort((a: any, b: any) => a.priority - b.priority);

        vm.searchLocationOptions = [];
        let count = 0;
        for (const data of response.data) {
          if (count >= 5) break;
          if (!('state_code' in data)) continue;

          if (data.type === 'STATE') {
            vm.searchLocationOptions.push({
              label: data.name,
              state_code: data.state_code,
              type: data.type,
            });
          } else if (data.type === 'REGION') {
            vm.searchLocationOptions.push({
              label: `${data.name} (Region), ${data.state_code}`,
              region: data.name,
              state_code: data.state_code,
              type: data.type,
            });
          } else {
            vm.searchLocationOptions.push({
              label: `${data.name}, ${data.state_code}`,
              locality: data.name,
              state_code: data.state_code,
              type: data.type,
            });
          }
          count++;
        }
        this.$scope.showLocationSearch = true;
      })
      .catch((error: any) => {
        console.error(error);
      });
  }

  searchLocationClicked(location: any): void {
    const vm = this;
    if (this.$scope.showState !== false) {
      this.$scope.searchControl.searchText = location.label;
      vm.searchText = location.label;
    } else if (location.type === 'REGION') {
      this.$scope.searchControl.searchText = location.region;
      vm.searchText = location.region;
    } else {
      this.$scope.searchControl.searchText = location.locality;
      vm.searchText = location.locality;
    }

    this.$scope.searchControl.searchLocality = location.locality;
    this.$scope.searchControl.searchState = location.state_code;
    this.$scope.searchControl.searchRegion = location.region;
    this.$scope.searchControl.searchUpdated();

    vm.searchLocality = location.locality;
    vm.searchState = location.state_code;
    vm.searchRegion = location.region;

    vm.searchType = this.locationLabel.toLowerCase();
    this.$scope.showEstateSearch = false;
    this.$scope.showLocationSearch = false;
  }

  searchKeywordClicked(): void {
    this.$scope.searchControl.searchLocality = false;
    this.$scope.searchControl.searchState = false;
    this.$scope.searchControl.searchRegion = false;
    this.$scope.searchControl.searchUpdated();

    this.searchLocality = false;
    this.searchState = false;
    this.searchRegion = false;
    this.searchType = this.keywordLabel.toLowerCase();
    this.$scope.showEstateSearch = false;
    this.$scope.showLocationSearch = false;
  }
}

export default DeSearchController;
