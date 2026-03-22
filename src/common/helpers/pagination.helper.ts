export function paginate(page = 1, limit = 20) {
  const take = Math.max(1, Math.min(100, Number(limit)));
  const currentPage = Math.max(1, Number(page));
  const skip = (currentPage - 1) * take;
  return { page: currentPage, limit: take, skip, take };
}
