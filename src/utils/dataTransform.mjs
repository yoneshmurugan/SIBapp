export function transformWeeklyData(summary) {
  if (!summary || typeof summary !== 'object') return [];

  const arrSafe = arr => Array.isArray(arr) ? arr : [];

  const allWeeksSet = new Set();
  [summary.referral_given, summary.tyftb_given, summary.M2M].forEach(arr => {
    arrSafe(arr).forEach(item => allWeeksSet.add(item._id.week));
  });
  const allWeeks = Array.from(allWeeksSet).sort((a, b) => a - b);

  const mapArr = arr => {
    const map = {};
    arrSafe(arr).forEach(item => map[item._id.week] = item.count);
    return map;
  };

  const referralMap = mapArr(summary.referral_given);
  const tyftbMap = mapArr(summary.tyftb_given);
  const m2mMap = mapArr(summary.M2M);

  return allWeeks.map((week, idx) => ({
    name: `Week${idx + 1}`,
    referral_given: referralMap[week] || 0, 
    tyftb_given: tyftbMap[week] || 0,  
    M2Ms: m2mMap[week] || 0  
  }));
}
