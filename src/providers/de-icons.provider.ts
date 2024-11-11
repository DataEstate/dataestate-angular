import { IServiceProvider } from 'angular';

export interface IDeIconsService {
  categoryIcon(categoryString: string): string | undefined;
}

class DeIconsProvider implements IServiceProvider {
  private categoryURL: string =
    'http://warehouse.dataestate.com.au/DE/categories/';

  // Configuration method
  public setCategoryURL(catURL: string): void {
    this.categoryURL = catURL;
  }

  // $get method to provide the service instance
  $get = (): IDeIconsService => {
    const categoryURL = this.categoryURL;

    const service: IDeIconsService = {
      categoryIcon: (categoryString: string): string | undefined => {
        if (categoryString !== undefined) {
          return `${categoryURL}${categoryString}.svg`;
        }
        return undefined;
      },
    };

    return service;
  };
}

export { DeIconsProvider };
