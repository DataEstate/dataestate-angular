function ValidityFilter(): (input: string) => string {
  return (input: string): string => {
    if (!input) {
      return '';
    }

    input = input.toUpperCase();

    const unitsMap: { [key: string]: string } = {
      M: 'month',
      D: 'day',
      Y: 'year',
    };

    const regex = /^(\d+)?([MDY])$/;
    const match = input.match(regex);

    if (match) {
      const number = match[1] ? parseInt(match[1], 10) : 1;
      const unit = unitsMap[match[2]];
      const plural = number > 1 ? 's' : '';
      return `${number} ${unit}${plural}`;
    }

    return input;
  };
}

export default ValidityFilter;
