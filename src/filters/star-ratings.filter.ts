const StarRatingsFilter = () => {
  return (ratingText: string | number): string => {
    const oneStar = '<span class="fa fa-star"></span>';
    const halfStar = '<span class="fa fa-star-half-empty"></span>';

    if (ratingText === 'NA' || ratingText === -1) {
      return '<div class="rating">Not Available</div>';
    }

    const rating = parseFloat(ratingText as string);
    if (isNaN(rating) || rating < 0 || rating > 5) {
      return '';
    }

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    let stars = '';
    for (let i = 0; i < fullStars; i++) {
      stars += oneStar;
    }
    if (hasHalfStar) {
      stars += halfStar;
    }

    return `<div class="rating">${stars}</div>`;
  };
};

// const starRatingsModule = angular
//   .module('starRatingsModule', [])
//   .filter('starratings', starRatingsFilter);
// }

export default StarRatingsFilter;
