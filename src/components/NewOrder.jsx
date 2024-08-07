import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { db } from "../firebase";
import {
  collection,
  serverTimestamp,
  addDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import moment from "moment";
import {
  calculateProfit,
  getAskValue,
  getBidValue,
  getManagerSettings,
} from "../utills/helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { updateUserById } from "../utills/firebaseHelpers";
import { setSelectedUser } from "../redux/slicer/userSlice";

const NewOrder = ({ onClose, selectedOrder }) => {
  const dispatch = useDispatch();
  const assetGroups = useSelector((state) => state.assetGroups);
  const orders = useSelector((state) => state.orders);
  const selectedUser = useSelector((state) => state.user.selectedUser);
  const user = useSelector((state) => state?.user?.user);
  const managers = useSelector((state) => state.managers);
  const managerSettings = getManagerSettings(managers, user.id);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState({
    volume: 0,
    sl: "",
    tp: "",
  });

  const symbols = useSelector((state) => state?.symbols);
  const [selectedSymbol, setSelectedSymbol] = useState(
    () => symbols.find((s) => s.id === selectedOrder?.symbolId) || symbols[0]
  );

  const [enableOpenPrice, setEnableOpenPrice] = useState(false);
  const [openPriceValue, setOpenPriceValue] = useState(null);

  const account = selectedUser?.account;

  useEffect(() => getSelectedUserData(), []);

  const getSelectedUserData = () => {
    if (!account?.account_no) return;
    const userDocRef = doc(db, "users", selectedUser.userId);
    const unsubscribe = onSnapshot(
      userDocRef,
      (userDocSnapshot) => {
        if (userDocSnapshot.exists()) {
          const data = userDocSnapshot.data();
          const ac = data?.accounts?.find(
            (ac) => ac.account_no === account?.account_no
          );
          const userData = {
            ...data,
            id: ac.account_no || userDocSnapshot.id,
            createdAt: { ...data.createdAt },
            account: ac,
            userId: userDocSnapshot.id,
          };
          dispatch(setSelectedUser(userData));
        } else {
          console.error("User ID does not exist in the database.");
        }
      },
      (error) => {
        console.error("Error fetching user:", error);
      }
    );
    return unsubscribe;
  };

  const activeOrdersProfit = parseFloat(account?.activeOrdersProfit) || 0;
  const activeOrdersSwap = parseFloat(account?.activeOrdersSwap) || 0;
  const totalMargin = parseFloat(account?.totalMargin) || 0;
  const bonus = parseFloat(account?.bonus);
  const allowBonus = selectedUser?.settings?.allowBonus;

  const pendingOrders = orders.filter(
    (o) =>
      o.userId === selectedUser?.id &&
      o.status === "Pending" &&
      o.account_no === account?.account_no
  );

  const calculateEquity = () => {
    let equity =
      parseFloat(account?.totalBalance) + activeOrdersProfit - activeOrdersSwap;
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
    const settings = selectedSymbol?.settings || {};
    const lot = settings.group === "commodities" ? +settings.lot || 1 : 1;
    if (selectedSymbol.symbol) {
      if (order.volume) {
        if (enableOpenPrice) {
          sum = order.volume * lot * openPriceValue;
        } else {
          sum = order.volume * lot * selectedSymbol.price;
        }
      }
    }
    const maintenanceMargin = settings.maintenanceMargin;
    if (leverage > 1 && maintenanceMargin > 0) {
      return (sum / leverage) * (maintenanceMargin / 100);
    }
    return sum;
  };
  const calculatedSum = calculateTotalSum();

  let potentialSL = 0,
    potentialTP = 0;
  if (selectedSymbol.symbol) {
    const settings = selectedSymbol?.settings || {};
    const lot = settings.group === "commodities" ? +settings.lot || 1 : 1;

    const { fee = 0, feeUnit } = settings;
    const symbolFee =
      feeUnit === "$" ? fee : (selectedSymbol?.price / 100) * fee;

    if (order.sl)
      potentialSL =
        +order.volume * lot * (order.sl - selectedSymbol.price) - symbolFee;
    if (order.tp)
      potentialTP =
        +order.volume * lot * (order.tp - selectedSymbol.price) - symbolFee;
  }

  const checkClosedMarketStatus = (t) => {
    const group = assetGroups.find((g) => g.title === t);
    if (!group) return false;
    return group.closedMarket;
  };

  const placeOrder = async (e, type) => {
    e.preventDefault();
    if (!account) return toast.error("Need an account number to start trading");

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
      lot,
    } = selectedSymbol?.settings || {};
    const volume =
      group === "commodities" && +lot >= 1
        ? +order.volume * +lot
        : +order.volume;

    if (
      (group === "commodities" && !closedMarket) ||
      (checkClosedMarketStatus(group) && !closedMarket)
    ) {
      const today = moment().utc();
      const weekDay = today.weekday();
      const hour = today.hour();
      if (weekDay == 0 || weekDay == 6 || hour < 9 || hour >= 23) {
        return toast.error(
          `${
            group === "commodities" ? "Commodities" : group
          } Market open on Mon-Fri: 9AM-23PM`
        );
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
          ? volume * bidSpread
          : volume * selectedSymbol.price * (bidSpread / 100);
    } else {
      spread =
        askSpreadUnit === "$"
          ? volume * askSpread
          : volume * selectedSymbol.price * (askSpread / 100);
    }

    const feeValue =
      feeUnit === "$" ? parseFloat(fee) : (calculatedSum / 100) * fee;

    let profit =
      calculateProfit(
        type,
        closedPrice,
        selectedSymbol.price,
        parseFloat(volume)
      ) - feeValue;

    const leverage = selectedUser?.settings?.leverage;
    if (leverage > 1 && maintenanceMargin > 0) {
      profit = (profit / leverage) * (maintenanceMargin / 100);
    }

    const ordersCollectionRef = collection(db, "orders");
    const formattedDate = new Date().toLocaleDateString("en-US");
    const dealPayload = {
      ...order,
      userId: selectedUser.userId,
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
      volume,
      sum: calculatedSum,
      fee: feeValue,
      swap: 0,
      account_no: account?.account_no,
      spread,
      enableOpenPrice,
      createdAt: formattedDate,
      createdTime: serverTimestamp(),
    };

    if (enableOpenPrice) {
      dealPayload.symbolValue = parseFloat(openPriceValue);
      dealPayload.profit = 0;
    }

    if (
      allowBonus &&
      calculatedSum > freeMargin - bonus &&
      account.totalBalance < 0
    ) {
      const spentBonus = Math.abs(account.totalBalance);
      if (bonus < spentBonus)
        return toast.error("Not enough bonus to cover the deal fee");

      account.totalBalance = account.totalBalance + spentBonus;
      account.bonus = +parseFloat(bonus - spentBonus)?.toFixed(2);
      account.bonusSpent = +parseFloat(bonusSpent + spentBonus)?.toFixed(2);
    }

    const userPayload = {
      accounts: selectedUser.accounts?.map((ac) => {
        if (ac.account_no !== account?.account_no) return ac;
        ac = { ...ac, ...account };
        return {
          ...ac,
          totalBalance: parseFloat(ac?.totalBalance - feeValue - spread),
          totalMargin: +totalMargin + +calculatedSum,
          activeOrdersProfit: +activeOrdersProfit + +dealPayload.profit,
        };
      }),
    };

    try {
      console.log("dealPayload", dealPayload);
      setLoading(true);
      await addDoc(ordersCollectionRef, dealPayload);
      await updateUserById(selectedUser.userId, userPayload);
      toast.success("Order created successfully", "success");
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
          {managerSettings?.trade ? (
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
                      const symbol = symbols.find(
                        (s) => s.id === e.target.value
                      );
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
                <label className="col-4" htmlFor="description">
                  Description
                </label>
                <div className="col">
                  <input
                    name="description"
                    id="description"
                    className="form-control"
                    disabled
                    readOnly
                    value={selectedSymbol.settings.description}
                  ></input>
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
                    // value={selectedSymbol.price}
                    required
                    readOnly={!enableOpenPrice}
                    disabled={!enableOpenPrice}
                    value={
                      enableOpenPrice ? openPriceValue : selectedSymbol.price
                    }
                    onChange={(e) => setOpenPriceValue(e.target.value)}
                    // onChange={handleOrderChange}
                  />
                </div>
                <div className="col-1">
                  <FontAwesomeIcon
                    cursor="pointer"
                    onClick={() =>
                      setOpenPriceValue(parseFloat(selectedSymbol.price))
                    }
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
                    Margin: {+calculatedSum?.toFixed(2)} USDT
                  </label>
                </div>
                <div className="col-1"></div>
              </div>
              <div className="form-group row">
                <div className="col-4"></div>
                <div className="col d-flex justify-content-center gap-5">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      id="market"
                      checked={!enableOpenPrice}
                      onChange={(e) => setEnableOpenPrice(false)}
                    />
                    <label className="form-check-label m-0" htmlFor="market">
                      Market
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      id="limit"
                      checked={enableOpenPrice}
                      onChange={(e) => {
                        if (openPriceValue !== selectedSymbol.price)
                          setOpenPriceValue(parseFloat(selectedSymbol.price));
                        setEnableOpenPrice(true);
                      }}
                    />
                    <label className="form-check-label m-0" htmlFor="limit">
                      Limit
                    </label>
                  </div>
                </div>
                <div className="col-1" />
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
          ) : (
            "You do not have permission to perform this action."
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default NewOrder;
