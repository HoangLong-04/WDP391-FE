export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "0 đ";
  }
  return `${Number(amount).toLocaleString('vi-VN')} đ`;
};


