import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { db } from "../firebase";
import {
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  collection,
  addDoc,
  getDoc,
} from "firebase/firestore";
import { calculateProfit } from "../utills/helpers";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { updateUserById } from "../utills/firebaseHelpers";

const DelOrderModal = ({ onClose, selectedOrder }) => {
  const [volume, setVolume] = useState(selectedOrder?.volume);
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState("Full");

  const closedPrice = selectedOrder?.currentPrice;
  const potentialProfit = selectedOrder?.profit;

  const updateOrderStatus = async (orderId, newStatus, newVolume) => {
    const orderRef = doc(db, "orders", orderId);
    const docSnapshot = await getDoc(orderRef);
    if (!docSnapshot.exists()) return toast.error("Order doesn't exist");

    const userRef = doc(db, "users", selectedOrder.userId);
    const userSnapshot = await getDoc(userRef);
    if (!userSnapshot.exists()) return toast.error("User doesn't exist");
    const userProfile = userSnapshot.data();

    let defaultAccount = userProfile?.accounts?.find((ac) => ac.isDefault);

    const newData = {
      status: newStatus,
      closedDate: serverTimestamp(),
      closedPrice,
    };

    if (newVolume) {
      newData.volume = newVolume;
      newData.sum = newVolume * closedPrice;
    }

    let totalMargin = parseFloat(defaultAccount?.totalMargin);
    if (newVolume) {
      totalMargin = +(defaultAccount?.totalMargin - newData.sum).toFixed(2);
    } else {
      totalMargin = +(defaultAccount?.totalMargin - selectedOrder.sum).toFixed(
        2
      );
    }
    defaultAccount = {
      ...defaultAccount,
      totalBalance:
        defaultAccount.totalBalance + selectedOrder.profit - selectedOrder.swap,
      totalMargin,
      activeOrdersProfit: +parseFloat(
        defaultAccount?.activeOrdersProfit - selectedOrder.profit
      ).toFixed(2),
      activeOrdersSwap: +parseFloat(
        defaultAccount?.activeOrdersSwap - selectedOrder.swap
      )?.toFixed(2),
    };

    if (
      userProfile?.settings?.allowBonus &&
      defaultAccount.totalBalance < 0 &&
      defaultAccount.bonus - Math.abs(defaultAccount.totalBalance) >= 0
    ) {
      const spentBonus = Math.abs(defaultAccount.totalBalance);
      if (defaultAccount.bonus < spentBonus)
        return toast.error("Not enough bonus to cover the loss");
      defaultAccount.totalBalance = defaultAccount.totalBalance + spentBonus;
      defaultAccount.bonus = +parseFloat(
        defaultAccount.bonus - spentBonus
      )?.toFixed(2);
      defaultAccount.bonusSpent = +parseFloat(
        defaultAccount.bonusSpent + spentBonus
      )?.toFixed(2);
    }

    const accounts = userProfile.accounts.map((ac) =>
      ac.account_no !== defaultAccount.account_no ? ac : defaultAccount
    );

    newData.balance = +parseFloat(defaultAccount.totalBalance)?.toFixed(2);
    if (docSnapshot.exists()) {
      await updateDoc(orderRef, newData);
      await updateUserById(userProfile.id, { accounts });
      toast.success("Order status updated successfully");
    } else {
      toast.error("Order does not exist");
    }
  };

  const updateUserBalance = async (orderPrice) => {
    const userRef = doc(db, "users", selectedOrder.userId);
    const userSnapshot = await getDoc(userRef);
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      await updateDoc(userRef, {
        totalBalance: userData?.totalBalance - orderPrice,
      });
    } else {
      toast.error("User not found");
    }
  };

  const createNewOrder = async () => {
    const formattedDate = new Date().toLocaleDateString("en-US");
    const newVolume = parseFloat(selectedOrder.volume) - parseFloat(volume);
    const newOrder1 = {
      ...selectedOrder,
      volume: newVolume,
      sum: newVolume * selectedOrder.symbolValue,
      profit: 0,
      createdTime: serverTimestamp(),
      createdAt: formattedDate,
      status: "Pending",
    };
    delete newOrder1.id;
    delete newOrder1.sltp;
    const orderRef = collection(db, "orders");
    await addDoc(orderRef, newOrder1);
  };

  const newOrder = async () => {
    if (type === "Partial") {
      if (parseFloat(volume) >= parseFloat(selectedOrder.volume)) {
        toast.error(
          "Please add a volume which is less than the current volume"
        );
      } else {
        setIsLoading(true);
        try {
          await createNewOrder();
          await updateOrderStatus(selectedOrder.id, "Closed", volume);
          // const orderPrice = volume * selectedOrder.symbolValue;
          // await updateUserBalance(orderPrice);
          onClose();
        } catch (error) {
          console.log(error);
          toast.error(error.message);
        }
        setIsLoading(false);
      }
    } else if (type === "Full") {
      setIsLoading(true);
      try {
        await updateOrderStatus(selectedOrder.id, "Closed");
        // await updateUserBalance(selectedOrder.sum);
        onClose();
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal
        size="md"
        show
        onHide={onClose}
        className="modal-style-edit modal-style-del"
        centered
      >
        <Modal.Header
          className="bg-transparent border-0 rounded-0 text-center p-1 pb-0 align-items-center"
          closeButton
        >
          <p className="bg-transparent text-white mb-0 w-100">
            Close order -- {selectedOrder.id} + {selectedOrder?.symbol}
          </p>
        </Modal.Header>
        <Modal.Body className="bg-secondry text-white d-flex flex-column gap-3 p-3 pt-0">
          <div className="d-flex flex-column justify-content-start align-items-start gap-2">
            <label className="form-check-label my-2 ms-2">Closing type:</label>
            <div className="d-flex align-items-center justify-content-around w-full ">
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  checked={type === "Full"}
                  name="inlineRadioOptions"
                  id="radioFull"
                  onChange={() => {
                    if (type !== "Full") setType("Full");
                  }}
                />
                <label className="form-check-labels" htmlFor="radioFull">
                  Full
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  checked={type === "Partial"}
                  name="inlineRadioOptions"
                  id="radioPartial"
                  onChange={() => {
                    if (type === "Full") setType("Partial");
                  }}
                />
                <label className="form-check-labels" htmlFor="radioPartial">
                  Partial
                </label>
              </div>
            </div>
          </div>
          {type === "Partial" && (
            <div className="row my-2">
              <label
                htmlFor="volumeTextInput"
                className="col-sm-4 col-form-label"
              >
                Volume
              </label>
              <div className="col-sm-8">
                <input
                  type="text"
                  className="form-control border-1 border-black rounded-0 input-number"
                  id="volumeTextInput"
                  onChange={(e) => {
                    setVolume(e.target.value);
                  }}
                  value={volume}
                />
              </div>
            </div>
          )}
          <div className="ps-3 fs-5">
            Current Price:
            <span className="ms-2 text-success">{closedPrice}</span>
          </div>
          <div className="ps-3 fs-5">
            Potential profit:
            <span
              className={`ms-2 ${
                potentialProfit > 0 ? "text-success" : "text-danger"
              }`}
            >
              {potentialProfit}
            </span>
          </div>
          <div className="w-100 text-center my-2">
            <button
              className="modal-close-btn btn btn-success fs-5 rounded-4 mx-auto"
              disabled={isLoading}
              onClick={() => {
                newOrder();
              }}
            >
              Close position
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DelOrderModal;
