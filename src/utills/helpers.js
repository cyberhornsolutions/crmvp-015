import moment from "moment";

export const calculateProfit = (type, currentPrice, symbolPrice, volume) => {
  //   console.log(9090, type, currentPrice, symbolPrice, volume);
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

export const convertTimestamptToDate = (date) => {
  const jsDate = new Date(date.seconds * 1000 + date.nanoseconds / 1000000);
  return moment(jsDate).format("MM/DD/YYYY hh:mm:ss A");
};

export const fillArrayWithEmptyRows = (arr, size) =>
  arr.concat(arr.length < size ? new Array(size - arr.length).fill("") : []);

export const getBidValue = (val) => parseFloat(val * 0.99).toFixed(6);

export const getAskValue = (val) => (+val + val / 100).toFixed(6);
