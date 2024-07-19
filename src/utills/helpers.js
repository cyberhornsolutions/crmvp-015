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
  !isDirectPrice ? val * (1 - bid / 100) : val - bid;

export const getAskValue = (val, ask, isDirectPrice = false) =>
  !isDirectPrice
    ? val * (1 + parseFloat(ask) / 100)
    : parseFloat(val) + parseFloat(ask);

export function getIPRange(startIP, endIP) {
  if (!startIP || !endIP) {
    return []; // or throw an error, depending on your requirements
  }
  let start = startIP.split(".").map(Number);
  let end = endIP.split(".").map(Number);
  let range = [];

  for (let i = start[0]; i <= end[0]; i++) {
    for (
      let j = i === start[0] ? start[1] : 0;
      j <= (i === end[0] ? end[1] : 255);
      j++
    ) {
      for (
        let k = i === start[0] && j === start[1] ? start[2] : 0;
        k <= (i === end[0] && j === end[1] ? end[2] : 255);
        k++
      ) {
        for (
          let l =
            i === start[0] && j === start[1] && k === start[2] ? start[3] : 0;
          l <= (i === end[0] && j === end[1] && k === end[2] ? end[3] : 255);
          l++
        ) {
          range.push(`${i}.${j}.${k}.${l}`);
        }
      }
    }
  }
  return range;
}

export const getRandomColorHex = () => {
  const randomChannel = () => Math.floor(Math.random() * 256);
  const b = randomChannel();
  const g = randomChannel();
  const r = randomChannel();
  const bHex = b.toString(16).padStart(2, "0");
  const gHex = g.toString(16).padStart(2, "0");
  const rHex = r.toString(16).padStart(2, "0");
  return `#${rHex}${gHex}${bHex}`;
};
