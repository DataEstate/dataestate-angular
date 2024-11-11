import {
  IAttributes,
  IAugmentedJQuery,
  ICompileService,
  IDirective,
  IScope,
} from 'angular';

interface IDeImgCreditScope extends IScope {
  creditText?: string;
  customClass?: string;
}

function DeImgCreditDirective($compile: ICompileService): IDirective {
  return {
    restrict: 'A',
    scope: {
      creditText: '=?deImgCredit',
      customClass: '@?deCreditClass',
    },
    link: (
      scope: IDeImgCreditScope,
      element: IAugmentedJQuery,
      attrs: IAttributes
    ) => {
      let creditElement: angular.IAugmentedJQuery | null = null;

      if (scope.creditText !== undefined && scope.creditText !== '') {
        const styleClass = scope.customClass ? ' ' + scope.customClass : '';
        const creditHtml = `<div class="de-img-credit${styleClass}">${scope.creditText}</div>`;
        creditElement = $compile(creditHtml)(scope);
        element.parent().append(creditElement);
      }

      scope.$on('$destroy', () => {
        if (creditElement) {
          creditElement.remove();
        }
      });
    },
  };
}

DeImgCreditDirective.$inject = ['$compile'];

export default DeImgCreditDirective;
