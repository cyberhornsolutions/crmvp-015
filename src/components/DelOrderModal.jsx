// Example: EditModal.js
import React, { useEffect, useState } from "react";
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

const DelOrderModal = ({
  onClose,
  show,
  selectedOrder,
  isMain,
  updateOrderState,
}) => {
  console.log(8080, selectedOrder.sum);
  const [isFull, setIsFull] = useState(false);
  const [volume, setVolume] = useState(selectedOrder.sum);
  const [isPartial, setIsPartial] = useState(false);
  const symbols = useSelector((state) => state?.symbols?.symbols);
  const price = symbols?.find((el) => el.symbol == selectedOrder?.symbol);
  const profit = calculateProfit(
    selectedOrder.type,
    price?.price,
    selectedOrder?.price,
    selectedOrder?.sum
  );
  const handleChange = (isChecked, type) => {
    if (type == "isFull") {
      setIsFull(true);
      setIsPartial(false);
    } else if (type == "isPartial") {
      setIsFull(false);
      setIsPartial(true);
    }
  };

  const updateOrderStatus = async (orderId, newStatus, volume1) => {
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
        onClose(); // Close the order

        return "Order status updated successfully";
      } else {
        throw new Error("Order does not exist");
      }
    } catch (error) {
      throw error;
    }
  };

  const newOrder = async () => {
    if (isPartial) {
      if (parseFloat(volume) > parseFloat(selectedOrder.sum)) {
        alert("ok");
        toast.error(
          "Please add a volume which is less or equal than the current volume"
        );
      } else {
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
          console.log(newOrder1, 777);
          const orderRef = collection(db, "orders");

          await addDoc(orderRef, newOrder1);
          await updateOrderStatus(selectedOrder.docId, "Closed", volume);
        } catch (error) {
          console.log(error, 777);
        }
      }
    } else {
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
              className="form-check-label fs-6 mb-2 ms-2"
              for="flexRadioDefault1"
            >
              Closing type:
            </label>
            <div className="d-flex gap-4 fs-6 ">
              <div class="form-check form-check-inline">
                <input
                  class="form-check-input"
                  type="radio"
                  name="inlineRadioOptions"
                  id="inlineRadio1"
                  value={isFull}
                  onChange={(e) => {
                    handleChange(e.target.checked, "isFull");
                  }}
                />
                <label class="form-check-labels" for="inlineRadio1">
                  Full
                </label>
              </div>
              <div class="form-check form-check-inline">
                <input
                  class="form-check-input"
                  type="radio"
                  name="inlineRadioOptions"
                  id="inlineRadio2"
                  value={isPartial}
                  onChange={(e) => {
                    handleChange(e.target.checked, "isPartial");
                  }}
                />
                <label class="form-check-labels" for="inlineRadio2">
                  Partial
                </label>
              </div>
            </div>
          </div>
          {isPartial && (
            <div className="row my-2">
              <label for="staticEmail" class="col-sm-4 col-form-label">
                Volume
              </label>
              <div class="col-sm-8">
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
