// const determineTotalReviews = (reviewsObject) => {
//   if (Object.keys(reviewsObject).length === 0) {
//     return 0;
//   }

//   let totalReviewCount = 0;

//   for (var reviewProp in reviewsObject) {
//     totalReviewCount += parseInt(reviewsObject[reviewProp]);
//   }

//   return totalReviewCount;
// };

const determineAverageRating = (ratingsObject) => {
  let total = 0;
  let reviewCount = 0;

  for (var rating in ratingsObject) {
    total += (rating * ratingsObject[rating]);
    reviewCount += parseInt(ratingsObject[rating]);
  }

  if (reviewCount === 0) {
    return 0;
  }

  return (total / reviewCount).toFixed(2);
};

const truncateAverageRating = (averageRating) => {
  averageRating = parseFloat(averageRating);
  if (averageRating === 0) {
    return 0.0;
  }
  return averageRating.toFixed(1);
};

const determinePercentageRecommend = (recommendedObject) => {
  var recommendationArray = Object.values(recommendedObject).map((val) => parseInt(val));
  var totalRecommendations = recommendationArray.reduce((total, val) => total += parseInt(val));

  if (recommendedObject[true] === undefined || totalRecommendations === 0) {
    return 0;
  }

  return (Math.round((recommendedObject[true] / totalRecommendations) * 100));
};

module.exports = {
  // determineTotalReviews,
  determineAverageRating,
  truncateAverageRating,
  determinePercentageRecommend,
};