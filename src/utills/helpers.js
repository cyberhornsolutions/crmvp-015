import moment from "moment";

export const calculateProfit = (type, currentPrice, symbolPrice, volume) => {
  let pnl = 0;
  if (type === "Sell") {
    pnl = parseFloat(symbolPrice) - parseFloat(currentPrice);
  } else if (type === "Buy") {
    pnl = parseFloat(currentPrice) - parseFloat(symbolPrice);
  }
  return pnl * parseFloat(volume);
};

export const filterSearchObjects = (search = "", data = []) =>
  data.filter(
    (obj, i) =>
      Object.values({ ...obj, id: i })
        .toString()
        .search(RegExp(search, "i")) > -1
  );

export const convertTimestamptToDate = (date) =>
  moment(date.seconds * 1000 + date.nanoseconds / 1000000).format(
    "DD/MM/YYYY hh:mm:ss A"
  );

export const makeServerDate = (currentDate) => {
  const seconds = Math.floor(currentDate.getTime() / 1000);
  const nanoseconds = currentDate.getMilliseconds();
  return { seconds, nanoseconds };
};

export const fillArrayWithEmptyRows = (arr, size) =>
  arr?.concat(arr.length < size ? new Array(size - arr.length).fill("") : []);

export const getBidValue = (val, bid, isDirectPrice = false) =>
  !isDirectPrice
    ? +parseFloat(val * (1 - bid / 100))?.toFixed(2)
    : +parseFloat(val - bid)?.toFixed(2);

export const getAskValue = (val, ask, isDirectPrice = false) =>
  !isDirectPrice
    ? +parseFloat(val * (1 + ask / 100))?.toFixed(2)
    : +parseFloat(+val + +ask)?.toFixed(2);
