import { IDirective, IAttributes, IAugmentedJQuery } from 'angular';
import DeSearchController from '../controllers/de-search.controller';
import { IDeSearchBarScope } from './de-search-bar.directive.types';

/**
 * Custom built search input that will search the Data Estate API. This requires the DE API services. Used as an attribute on INPUT
 * This requires the parent "de-search" container.
 * search-types (| separated string) - Indicates what search types to enable.
 * 	- KEYWORD (default) - No popup, just does a keyword search to the API.
 *  - ESTATE (default) - Brings up a popup list of estates matching the name.
 *  - LOCATION (default) - Brings up a list of locations.
 * on-submit (function($searchScope)) - Optional. Used for when location is clicked or keyword is clocked.
 * 		Returns the $searchScope object, with three properties: keyword, locality and state_code.
 * on-close (function($searchScope)) - Optional. Similar to the above, but fired when the dropdown closes.
 * on-clear (function($searchScope)) - Optional. Fired when the search field is cleared,
 * defaul-filters = param object to be applied onto estate search.
 */
function DeSearchBarDirective(): IDirective<
  IDeSearchBarScope,
  IAugmentedJQuery,
  IAttributes,
  DeSearchController
> {
  return {
    restrict: 'A',
    require: '^^?deSearch',
    scope: {
      searchModes: '@?',
      searchText: '=?ngModel',
      onSubmit: '&?',
      onClose: '&?',
      onClear: '&?',
      defaultFilters: '=?',
    },
    link: (
      scope: IDeSearchBarScope,
      elem: IAugmentedJQuery,
      attr: IAttributes,
      parentCtrl: DeSearchController
    ) => {
      if (parentCtrl) {
        parentCtrl.setSearchControl(scope);
      }

      scope.$watch(
        'searchText',
        (newVal: string, oldVal: string) => {
          if (newVal !== oldVal) {
            if (parentCtrl) {
              parentCtrl.searchChanged(newVal, oldVal);
            }
          }
          if (newVal === '' && scope.onClear) {
            scope.onClear({
              $searchScope: {
                keyword: '',
                region: false,
                locality: false,
                state_code: false,
              },
            });
          }
        },
        true
      );

      scope.searchUpdated = () => {
        if (scope.onSubmit) {
          const searchScope = {
            keyword: scope.searchText,
            region: scope.searchRegion,
            locality: scope.searchLocality,
            state_code: scope.searchState,
          };
          scope.onSubmit({ $searchScope: searchScope });
        }
      };
    },
  };
}

export default DeSearchBarDirective;
