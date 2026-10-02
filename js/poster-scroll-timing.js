// Extra reading room for the opening poster; subsequent credits keep their pace.
export function createPosterScrollTiming(count, getTravel) {
  let hold = 0, travel = 1;
  const measure = () => {
    hold = Math.max(220, Math.min(360, innerHeight * .32));
    travel = Math.max(1, getTravel());
    return hold + travel;
  };
  measure();
  return {
    measure,
    progress: value => Math.max(0, Math.min(1, (value * (hold + travel) - hold) / travel)),
    atIndex: index => index === 0 ? 0 : (hold + travel * index / Math.max(1, count - 1)) / (hold + travel)
  };
}
