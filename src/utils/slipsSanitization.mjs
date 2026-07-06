export function sanitizeReferralData(data) {

  Object.keys(data).forEach(key => {
    const value = data[key];
    if (
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "")     ) {
      delete data[key];
    }
  });

  return data;
}   
