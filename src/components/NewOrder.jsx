import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { db } from "../firebase";
import { collection, serverTimestamp, addDoc } from "firebase/firestore";
import moment from "moment";
import { calculateProfit, getAskValue, getBidValue } from "../utills/helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { updateUserById } from "../utills/firebaseHelpers";

const NewOrder = ({ onClose, selectedOrder }) => {
  const selectedUser = useSelector((state) => state.user.selectedUser);
  const orders = useSelector((state) => state.orders);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState({
    volume: 0,
    sl: null,
    tp: null,
  });
  const symbols = useSelector((state) => state?.symbols);
  const [selectedSymbol, setSelectedSymbol] = useState(
    () => symbols.find((s) => s.id === selectedOrder.symbolId) || {}
  );

  const [enableOpenPrice, setEnableOpenPrice] = useState(false);
  const [openPriceValue, setOpenPriceValue] = useState(null);

  const activeOrdersProfit = parseFloat(selectedUser?.activeOrdersProfit) || 0;
  const activeOrdersSwap = parseFloat(selectedUser?.activeOrdersSwap) || 0;
  const totalMargin = parseFloat(selectedUser?.totalMargin) || 0;
  const allowBonus = selectedUser?.settings?.allowBonus;
  const bonus = parseFloat(selectedUser?.bonus);

  const pendingOrders = orders.filter(
    (o) => o.userId === selectedUser?.id && o.status === "Pending"
  );

  const calculateEquity = () => {
    let equity =
      parseFloat(selectedUser?.totalBalance) +
      activeOrdersProfit -
      activeOrdersSwap;
    if (allowBonus) equity += bonus;
    return equity;
  };

  const equity = calculateEquity();

  const calculateFreeMargin = () => {
    const dealSum = pendingOrders.reduce((p, v) => p + +v.sum, 0);
    return equity - dealSum;
  };

  const freeMargin = calculateFreeMargin();

  const handleOrderChange = (e) =>
    setOrder((p) => ({ ...p, [e.target.name]: e.target.value }));

  const calculateTotalSum = () => {
    let sum = 0.0;
    const leverage = selectedUser?.settings?.leverage || 1;
    if (selectedSymbol.symbol) {
      if (order.volume) {
        if (enableOpenPrice) {
          sum = order.volume * openPriceValue;
        } else {
          sum = order.volume * selectedSymbol.price;
        }
      }
    }
    const maintenanceMargin = selectedSymbol?.settings?.maintenanceMargin;
    if (leverage > 1 && maintenanceMargin > 0) {
      return (sum / leverage) * (maintenanceMargin / 100);
    }
    return sum;
  };
  const calculatedSum = calculateTotalSum();

  let potentialSL = 0,
    potentialTP = 0;
  if (selectedSymbol.symbol) {
    if (order.sl)
      potentialSL = order.volume * order.sl - selectedSymbol?.settings?.fee;
    if (order.tp)
      potentialTP = order.volume * order.tp - selectedSymbol?.settings?.fee;
  }

  const placeOrder = async (e, type) => {
    e.preventDefault();

    const minDealSum = selectedUser?.settings?.minDealSum;
    const maxDeals = selectedUser?.settings?.maxDeals;

    if (!selectedUser?.allowTrading)
      return toast.error("Trading is disabled for you.");
    if (pendingOrders.length >= maxDeals)
      return toast.error(`You can open maximum ${maxDeals} deals`);
    if (!selectedSymbol.symbol) return toast.error("Symbol is missing.");
    if (!order.volume || order.volume <= 0)
      return toast.error("Volume should be greater than 0.");
    if (calculatedSum < minDealSum)
      return toast.error(`The minimum deal sum is ${minDealSum} USDT`);
    if (calculatedSum > freeMargin)
      return toast.error("Not enough money to cover the Maintenance margin");

    const {
      bidSpread,
      bidSpreadUnit,
      askSpread,
      askSpreadUnit,
      fee,
      feeUnit,
      contractSize,
      group,
      closedMarket,
      maintenanceMargin,
    } = selectedSymbol?.settings || {};

    if (group === "commodities" && !closedMarket) {
      const today = moment();
      const weekDay = today.weekday();
      const hour = today.hour();
      if (weekDay == 0 || weekDay == 6 || hour < 9 || hour >= 23) {
        return toast.error("Commodities Market open on Mon-Fri: 9AM-23PM");
      }
    }

    if (calculatedSum > contractSize) {
      return toast.error(
        `Cannot open deal greater than ${contractSize}$ for this symbol`
      );
    }

    let closedPrice =
      type === "Buy"
        ? getBidValue(selectedSymbol.price, bidSpread, bidSpreadUnit === "$")
        : getAskValue(selectedSymbol.price, askSpread, askSpreadUnit === "$");

    closedPrice =
      group === "currencies"
        ? +parseFloat(closedPrice)?.toFixed(6)
        : +parseFloat(closedPrice)?.toFixed(2);

    if (
      type == "Buy" &&
      ((order.sl && order.sl >= closedPrice) ||
        (order.tp && order.tp <= selectedSymbol.price))
    ) {
      return toast.error(
        "To Buy SL should be less than the bid value and TP should be greater than the current value"
      );
    } else if (
      type == "Sell" &&
      ((order.sl && order.sl <= closedPrice) ||
        (order.tp && order.tp >= selectedSymbol.price))
    ) {
      return toast.error(
        "To Sell SL should be greater than the ask value and TP should be less than the current value"
      );
    }

    let spread;
    if (type === "Buy") {
      spread =
        bidSpreadUnit === "$"
          ? order.volume * bidSpread
          : order.volume * selectedSymbol.price * (bidSpread / 100);
    } else {
      spread =
        askSpreadUnit === "$"
          ? order.volume * askSpread
          : order.volume * selectedSymbol.price * (askSpread / 100);
    }

    const feeValue =
      feeUnit === "$" ? parseFloat(fee) : (calculatedSum / 100) * fee;

    let profit =
      calculateProfit(
        type,
        closedPrice,
        selectedSymbol.price,
        parseFloat(order.volume)
      ) - feeValue;

    const leverage = selectedUser?.settings?.leverage;
    if (leverage > 1 && maintenanceMargin > 0) {
      profit = (profit / leverage) * (maintenanceMargin / 100);
    }

    const ordersCollectionRef = collection(db, "orders");
    const formattedDate = new Date().toLocaleDateString("en-US");
    const dealPayload = {
      ...order,
      userId: selectedUser.id,
      type,
      status: "Pending",
      profit:
        group === "currencies"
          ? +parseFloat(profit).toFixed(6)
          : +parseFloat(profit).toFixed(2),
      currentPrice: closedPrice,
      currentMarketPrice: parseFloat(selectedSymbol?.price),
      symbol: selectedSymbol.symbol,
      symbolId: selectedSymbol.id,
      symbolValue: selectedSymbol.price,
      volume: parseFloat(order.volume),
      sum: calculatedSum,
      fee: feeValue,
      swap: 0,
      spread,
      enableOpenPrice,
      createdAt: formattedDate,
      createdTime: serverTimestamp(),
    };

    if (enableOpenPrice) {
      dealPayload.symbolValue = parseFloat(openPriceValue);
      dealPayload.profit = 0;
    }

    const userPayload = {
      totalBalance: parseFloat(selectedUser?.totalBalance - feeValue - spread),
      totalMargin: +totalMargin + +calculatedSum,
      activeOrdersProfit: +activeOrdersProfit + +dealPayload.profit,
    };

    if (
      allowBonus &&
      calculatedSum > freeMargin - bonus &&
      userPayload.totalBalance < 0
    ) {
      const spentBonus = Math.abs(userPayload.totalBalance);
      if (bonus < spentBonus)
        return toast.error("Not enough bonus to cover the deal fee");

      userPayload.totalBalance = userPayload.totalBalance + spentBonus;
      userPayload.bonus = +parseFloat(bonus - spentBonus)?.toFixed(2);
      userPayload.bonusSpent = +parseFloat(bonusSpent + spentBonus)?.toFixed(2);
    }
    try {
      setLoading(true);
      await addDoc(ordersCollectionRef, dealPayload);
      await updateUserById(selectedUser.id, userPayload);
      toast.success("Order added to Database", "success");
      onClose();
    } catch (error) {
      console.error("Error adding order: ", error);
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <>
      <Modal size="md" show onHide={onClose} centered>
        <Modal.Header title="New deal" closeButton>
          <h5 className="mb-0">New deal</h5>
        </Modal.Header>
        <Modal.Body>
          <form className="d-flex gap-4 flex-column">
            <div className="form-group row align-items-center">
              <label className="col-4" htmlFor="sl">
                Symbol
              </label>
              <div className="col">
                <select
                  name="symbol"
                  id="symbol"
                  className="form-select"
                  required
                  value={selectedSymbol.id}
                  onChange={(e) => {
                    const symbol = symbols.find((s) => s.id === e.target.value);
                    if (symbol) setSelectedSymbol(symbol);
                  }}
                >
                  {symbols.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.symbol}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-1"></div>
            </div>
            <div className="form-group row align-items-center">
              <label className="col-4" htmlFor="price">
                Price
              </label>
              <div className="col">
                <input
                  name="price"
                  id="price"
                  type="number"
                  step="any"
                  placeholder="Price"
                  className="form-control"
                  value={selectedSymbol.price}
                  required
                  readOnly
                  // onChange={handleOrderChange}
                />
              </div>
              <div className="col-1">
                <FontAwesomeIcon
                  cursor="pointer"
                  // onClick={() => getValue(orderData?.symbol)}
                  icon={faRefresh}
                />
              </div>
            </div>
            <div className="form-group row">
              <label className="col-4" htmlFor="volume">
                Volume
              </label>
              <div className="col">
                <input
                  name="volume"
                  id="volume"
                  type="number"
                  step="any"
                  placeholder="Volume"
                  className="form-control"
                  value={order.volume}
                  required
                  onChange={handleOrderChange}
                />
                <label className="mt-1">
                  Total: {+calculatedSum?.toFixed(2)} USDT
                </label>
              </div>
              <div className="col-1"></div>
            </div>
            <div className="form-group row align-items-center">
              <label className="col-4" htmlFor="openPriceValue">
                Open Price
              </label>
              <div className="col">
                <input
                  name="openPriceValue"
                  id="openPriceValue"
                  type="number"
                  step="any"
                  placeholder="Open Price"
                  className="form-control"
                  value={openPriceValue}
                  disabled={!enableOpenPrice}
                  onChange={(e) => setOpenPriceValue(e.target.value)}
                />
              </div>
              <div className="col-1 align-items-center">
                <input
                  type="checkbox"
                  checked={enableOpenPrice}
                  onChange={(e) => {
                    setOpenPriceValue(parseFloat(selectedSymbol.price));
                    setEnableOpenPrice(e.target.checked);
                  }}
                />
              </div>
            </div>
            <div className="form-group row">
              <label className="col-4" htmlFor="sl">
                SL
              </label>
              <div className="col">
                <input
                  name="sl"
                  id="sl"
                  type="number"
                  step="any"
                  placeholder="SL"
                  className="form-control"
                  value={order.sl}
                  onChange={handleOrderChange}
                />
                <label className="text-muted">
                  Potential: {+parseFloat(potentialSL)?.toFixed(2)}
                </label>
              </div>
              <div className="col-1"></div>
            </div>
            <div className="form-group row">
              <label className="col-4" htmlFor="tp">
                TP
              </label>
              <div className="col">
                <input
                  name="tp"
                  id="tp"
                  type="number"
                  step="any"
                  placeholder="TP"
                  className="form-control"
                  value={order.tp}
                  onChange={handleOrderChange}
                />
                <label className="text-muted">
                  Potential: {+parseFloat(potentialTP)?.toFixed(2)}
                </label>
              </div>
              <div className="col-1"></div>
            </div>
            <div className="d-flex flex-column gap-2 mb-2">
              <Button
                className="w-50 mx-auto"
                variant="success"
                type="submit"
                onClick={(e) => placeOrder(e, "Buy")}
                disabled={loading}
              >
                Buy
              </Button>
              <Button
                className="w-50 mx-auto"
                variant="danger"
                type="submit"
                disabled={loading}
                onClick={(e) => placeOrder(e, "Sell")}
              >
                Sell
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default NewOrder;
