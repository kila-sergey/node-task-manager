const isAllUpdateParamsAllowed = (updatedParams, allowedParams) => {
  return updatedParams.every((updatedParam) => {
    return allowedParams.includes(updatedParam);
  });
};

const isAllRequiredParamsIncluded = (updatedParams, requiredParams) => {
  return requiredParams.every((requiredParam) => {
    return !!updatedParams.find(
      (updatedParam) => updatedParam === requiredParam
    );
  });
};

module.exports = {
  isAllUpdateParamsAllowed,
  isAllRequiredParamsIncluded,
};
