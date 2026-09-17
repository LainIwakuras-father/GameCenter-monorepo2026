export const getIsScrolledToBottom = (
  element: HTMLDivElement | undefined | null,
) => {
  const scrollTop = element?.scrollTop || 0;
  const clientHeight = element?.clientHeight || 0;
  const scrollHeight = element?.scrollHeight || 0;

  // 5 – погрешность
  return scrollHeight - scrollTop - clientHeight <= 5;
};
