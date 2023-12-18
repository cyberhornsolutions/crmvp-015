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

const DelOrderModal = ({ onClose, show, selectedOrder }) => {
  const [volume, setVolume] = useState(selectedOrder.sum);
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState("Full");
  const symbols = useSelector((state) => state?.symbols?.symbols);
  const price = symbols?.find((el) => el.symbol == selectedOrder?.symbol);
  const profit = calculateProfit(
    selectedOrder.type,
    price?.price,
    selectedOrder?.price,
    selectedOrder?.sum
  );

  const updateOrderStatus = async (orderId, newStatus, volume1) => {
    setIsLoading(true);
    try {
      const orderRef = doc(db, "orders", orderId);
      const docSnapshot = await getDoc(orderRef);
      let newData = {};

      if (volume1 != null) {
        const newVolume = parseFloat(selectedOrder.sum) - parseFloat(volume1);
        newData = {
          status: newStatus,
          closedDate: serverTimestamp(),
          closedPrice: price?.price,
          profit: profit,
          closedVolume: newVolume,
        };
      } else {
        newData = {
          status: newStatus,
          closedDate: serverTimestamp(),
          closedPrice: price?.price,
          profit: profit,
        };
      }
      if (docSnapshot.exists()) {
        // Update the order status
        await updateDoc(orderRef, newData);
        toast.success("Order status updated successfully");
        onClose(); // Close the order
      } else {
        toast.error("Order does not exist");
      }
    } catch (error) {
      toast.error(error.message);
    }
    setIsLoading(false);
  };

  const newOrder = async () => {
    if (type === "Partial") {
      if (parseFloat(volume) > parseFloat(selectedOrder.sum)) {
        toast.error(
          "Please add a volume which is less or equal than the current volume"
        );
      } else {
        setIsLoading(true);

        try {
          const formattedDate = new Date().toLocaleDateString("en-US");

          const newOrder1 = {
            symbol: selectedOrder.symbol,
            symbolValue: selectedOrder.price,
            volume: volume,
            sl: selectedOrder.sl,
            tp: selectedOrder.tp,
            profit: 0,
            createdTime: serverTimestamp(),
            type: selectedOrder.type,
            createdAt: formattedDate,
            status: "Pending",
            userId: selectedOrder.userId,
            closedPrice: null,
            closedDate: null,
          };
          const orderRef = collection(db, "orders");

          await addDoc(orderRef, newOrder1);
          setIsLoading(false);

          await updateOrderStatus(selectedOrder.docId, "Closed", volume);
        } catch (error) {
          console.log(error);
        }
      }
    } else if (type === "Full") {
      await updateOrderStatus(selectedOrder.docId, "Closed");
    }
  };

  return (
    <>
      <Modal
        size="md"
        show={show}
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
            <label
              className="form-check-label my-2 ms-2"
              for="flexRadioDefault1"
            >
              Closing type:
            </label>
            <div className="d-flex align-items-center justify-content-around w-full ">
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="inlineRadioOptions"
                  id="inlineRadio1"
                  onChange={() => {
                    if (type !== "Full") setType("Full");
                  }}
                />
                <label className="form-check-labels" for="inlineRadio1">
                  Full
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="inlineRadioOptions"
                  id="inlineRadio2"
                  onChange={() => {
                    if (type === "Full") setType("Partial");
                  }}
                />
                <label className="form-check-labels" for="inlineRadio2">
                  Partial
                </label>
              </div>
            </div>
          </div>
          {type === "Partial" && (
            <div className="row my-2">
              <label for="staticEmail" className="col-sm-4 col-form-label">
                Volume
              </label>
              <div className="col-sm-8">
                <input
                  type="text"
                  className="form-control border-1 border-black rounded-0 input-number"
                  id="staticEmail"
                  onChange={(e) => {
                    setVolume(e.target.value);
                  }}
                  value={volume}
                />
              </div>
            </div>
          )}
          <div className="ps-3 fs-5">
            Current Price: {profit}
            <span className="ms-2 text-success">{price?.price}</span>
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
