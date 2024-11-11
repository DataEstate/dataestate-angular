import { IScope } from 'angular';

export interface IDeSearchBarScope extends IScope {
  searchModes?: string;
  searchText?: string;
  onSubmit?: (args: { $searchScope: Record<string, any> }) => void;
  onClose?: (args: { $searchScope: Record<string, any> }) => void;
  onClear?: (args: { $searchScope: Record<string, any> }) => void;
  defaultFilters?: any;
  searchUpdated: () => void;

  // These properties are set by the parent controller
  searchLocality?: string | false;
  searchRegion?: string | false;
  searchState?: string | false;
}
