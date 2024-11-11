// filter-id.filter.ts

import * as angular from 'angular';

interface DeObject {
  id: string | number;
  [key: string]: any;
}

function FilterIdFilter(): (
  deObj: DeObject[] | null | undefined,
  objId: string | number,
  field?: string
) => any {
  return (
    deObj: DeObject[] | null | undefined,
    objId: string | number,
    field?: string
  ): any => {
    if (!Array.isArray(deObj) || objId === undefined || objId === null) {
      return '';
    }

    for (const item of deObj) {
      if (item.id == objId) {
        if (field === undefined) {
          return item;
        } else {
          return item[field];
        }
      }
    }
    return '';
  };
}

export default FilterIdFilter;
