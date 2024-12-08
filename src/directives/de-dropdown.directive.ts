import {
  IScope,
  IDirective,
  IAttributes,
  IRootScopeService,
  IAugmentedJQuery,
  IAngularEvent,
} from 'angular';

export interface IDeDropdownScope extends IScope {
  multiple: boolean;
  label: any;
  options: any[];
  model: any[] | any;
  labelModel?: any[] | any;
  labelField?: string;
  valueField?: string;
  buttonText?: string;
  onSubmit?: (args: {
    $searchScope: any;
    $event: Event | IAngularEvent;
  }) => void;
  onClose?: (args: {
    $searchScope: any;
    $event: Event | IAngularEvent;
  }) => void;

  // Internal properties
  popupOpen: boolean;
  clearButtonText: string;
  parentId: string | number;

  // Methods
  optionClicked: (optionVal: any, ev: Event) => void;
  toggleDropdown: (ev: Event, open?: boolean) => void;
  togglePopup: (open?: boolean) => void;
  itemInArray: (haystack: any[], needle: any) => boolean;
  inputLabel: (item: any) => any;
  submitSelection: (ev: Event) => void;
  clearSelection: (ev: Event) => void;
  noInvoke: (ev: Event) => void;
}

/**
 * Creates a custom dropdown menu. Used as an element.
 * DOM Attributes:
 * multi (bool | expression) - Indicates whether the selection allows for multiple selection.
 * label (expression) - Label of the control. It can be a function.
 * options (array | expression) - The source of the dropdown menu. This needs to be an array.
 * model (angular scope) - The two-way bound scope for the selected (array or single value), hijects the ng-model.
 * label-model (angular scope) - Optional, used to contain selected "label" if the selected value is not sufficient.
 * label-field (string) - Optional. If the options is an array of objects, indicates which property to use to show in the option's label.
 * value-field (string) - Optional. If the options is an array of objects, indicates which property to use to show in the option's value. Also shows what is returned.
 * button-text (expression) - Optional. Used for the "Apply" button label.
 * on-submit (function($searchScope, $event)) - Optional. Used for when the apply button is clicked. Default is closing the menu.
 * 		returns the $searchScope object with 2 properties, selectedValue and selectedLabel
 * on-close (function($searchScope, $event)) - Optional. Similar to on submit, but is fired with the dropdown window is dismissed.
 */
function DeDropdownDirective(
  $rootScope: IRootScopeService
): IDirective<IDeDropdownScope> {
  return {
    restrict: 'E',
    scope: {
      multiple: '=multi',
      label: '=label',
      options: '=options',
      model: '=ngModel',
      labelModel: '=?',
      labelField: '@?',
      valueField: '@?',
      buttonText: '=?buttonLabel',
      onSubmit: '&?',
      onClose: '&?',
    },
    link: (
      scope: IDeDropdownScope,
      elem: IAugmentedJQuery,
      attr: IAttributes
    ) => {
      scope.popupOpen = false;
      if (scope.buttonText === undefined) {
        scope.buttonText = 'Apply';
      }
      scope.clearButtonText = 'Clear';
      const winClickEventConstant = 'windowsClicked';

      window.onclick = (ev: MouseEvent) => {
        $rootScope.$broadcast(winClickEventConstant);
      };

      scope.$on(winClickEventConstant, (ev: IAngularEvent, data: any) => {
        console.log('Clicked');
        if (data) {
          if (data.$id !== scope.$id && scope.popupOpen) {
            scope.popupOpen = false;
            if (scope.onClose) {
              const searchScope = {
                selectedValue: scope.model,
                selectedLabel: scope.labelModel,
              };
              scope.onClose({ $searchScope: searchScope, $event: ev });
            }
          }
        } else {
          scope.$apply(() => {
            if (scope.popupOpen) {
              scope.popupOpen = false;
              if (scope.onClose) {
                const searchScope = {
                  selectedValue: scope.model,
                  selectedLabel: scope.labelModel,
                };
                scope.onClose({ $searchScope: searchScope, $event: ev });
              }
            }
          });
        }
      });

      scope.parentId = attr.id !== undefined ? attr.id : scope.$id.toString();

      if (scope.multiple) {
        if (!Array.isArray(scope.model)) {
          scope.model = [];
        }
      }

      scope.optionClicked = (optionVal: any, ev: Event) => {
        if (ev) {
          ev.stopPropagation();
        }

        let checkedItem = optionVal;
        if (scope.valueField !== undefined) {
          checkedItem = optionVal[scope.valueField];
        }

        let itemIndex = -1;
        if (scope.multiple) {
          itemIndex = (scope.model as any[]).indexOf(checkedItem);
          if (itemIndex >= 0) {
            (scope.model as any[]).splice(itemIndex, 1);
          } else {
            (scope.model as any[]).push(checkedItem);
          }
        } else {
          scope.model = checkedItem;
          scope.popupOpen = false;
        }

        // Label Model (if used)
        if (scope.labelModel !== undefined) {
          let labelItem = optionVal;
          if (scope.labelField !== undefined) {
            labelItem = optionVal[scope.labelField];
          }
          if (scope.multiple) {
            if (!Array.isArray(scope.labelModel)) {
              scope.labelModel = [];
            }
            if (itemIndex >= 0) {
              (scope.labelModel as any[]).splice(itemIndex, 1);
            } else {
              (scope.labelModel as any[]).push(labelItem);
            }
          } else {
            scope.labelModel = labelItem;
          }
        }

        if (!scope.multiple) {
          // Not Multiple, send submit message.
          if (scope.onSubmit) {
            const searchScope = {
              selectedValue: scope.model,
              selectedLabel: scope.labelModel,
            };
            scope.onSubmit({ $searchScope: searchScope, $event: ev });
          }
        }
      };

      scope.toggleDropdown = (ev: Event, open?: boolean) => {
        if (ev) {
          ev.stopPropagation();
          $rootScope.$broadcast(winClickEventConstant, scope);
        }
        scope.togglePopup(open);
      };

      scope.togglePopup = (open?: boolean) => {
        if (open === undefined) {
          scope.popupOpen = !scope.popupOpen;
        } else {
          scope.popupOpen = open;
        }
      };

      scope.itemInArray = (haystack: any[], needle: any): boolean => {
        let needleItem = needle;
        if (scope.valueField !== undefined) {
          needleItem = needle[scope.valueField];
        }
        return haystack.indexOf(needleItem) >= 0;
      };

      scope.inputLabel = (item: any): any => {
        if (scope.labelField !== undefined) {
          return item[scope.labelField];
        } else {
          return item;
        }
      };

      scope.submitSelection = (ev: Event) => {
        if (scope.onSubmit) {
          const searchScope = {
            selectedValue: scope.model,
            selectedLabel: scope.labelModel,
          };
          scope.onSubmit({ $searchScope: searchScope, $event: ev });
        }
      };

      scope.clearSelection = (ev: Event) => {
        if (ev) {
          ev.stopPropagation();
        }
        if (scope.multiple && Array.isArray(scope.model)) {
          (scope.model as any[]).length = 0;
        } else {
          scope.model = undefined;
        }
        if (scope.labelModel !== undefined) {
          if (scope.multiple && Array.isArray(scope.labelModel)) {
            (scope.labelModel as any[]).length = 0;
          } else {
            scope.labelModel = undefined;
          }
        }
      };

      scope.noInvoke = (ev: Event) => {
        ev.stopPropagation();
      };
    },
    template: `
      <div class="de-dropdown {{class}}" ng-click="toggleDropdown($event)">{{label}}</div>
      <div class="de-dropdown-menu" ng-show="popupOpen">
        <ul class="de-dropdown-menu-list">
          <li ng-repeat="option in options track by $index">
            <label for="{{parentId}}-{{$index}}" ng-click="noInvoke($event)">
              <input type="checkbox" name="{{parentId}}-{{$index}}" ng-checked="itemInArray(model, option)" id="{{parentId}}-{{$index}}" ng-show="multiple"
                ng-click="optionClicked(option, $event)">
              <span>{{ inputLabel(option) }}</span>
            </label>
          </li>
        </ul>
        <button type="button" class="de-button btn-clear" ng-click="clearSelection($event)" ng-if="multiple">{{ clearButtonText }}</button>
        <button type="button" class="de-button" ng-click="submitSelection($event)">{{ buttonText }}</button>
      </div>
    `,
  };
}

DeDropdownDirective.$inject = ['$rootScope'];

export default DeDropdownDirective;
