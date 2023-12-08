export const calculateProfit = (type, currentPrice, symbolPrice, volume) => {
  //   console.log(9090, type, currentPrice, symbolPrice, volume);
  let pnl = 0;
  if (type === "Sell") {
    pnl = parseFloat(symbolPrice) - parseFloat(currentPrice);
  } else if (type === "Buy") {
    pnl = parseFloat(currentPrice) - parseFloat(symbolPrice);
  }
  console.log(pnl, 9090);
  return pnl * parseFloat(volume);
};
