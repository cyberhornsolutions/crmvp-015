// Example: EditModal.js
import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";

const DelOrderModal = ({
  onClose,
  show,
  selectedOrder,
  isMain,
  updateOrderState,
}) => {
  const [price, setPrice] = useState(0);
  const [isFull, setIsFull] = useState(false);
  const [isPartial, setIsPartial] = useState(false);
  const handleChange = (isChecked, type) => {
    if (type == "isFull") {
      setIsFull(true);
      setIsPartial(false);
    } else if (type == "isPartial") {
      setIsFull(false);
      setIsPartial(true);
    }
  };

  const getSymbolValue = () => {
    return new Promise((resolve, reject) => {
      try {
        const symbolsCollection = collection(db, "symbols");
        const q = query(
          symbolsCollection,
          where("symbol", "==", selectedOrder.symbol)
        );
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          let price = null;
          querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            price = doc.data().price;
          });
          const parsePrice = parseFloat(price);
          resolve(setPrice(parsePrice));
        });
        // If you need to handle errors within the snapshot listener
        // querySnapshot should have an error handler
        // querySnapshot.onError((error) => reject(error));
      } catch (error) {
        reject(error);
      }
    });
  };

  useEffect(() => {
    getSymbolValue();
  }, []);

  const updateOrderStatus = (docId, newStatus) => {
    return new Promise((resolve, reject) => {
      try {
        const orderRef = doc(db, "orders", docId);

        const unsubscribe = onSnapshot(
          orderRef,
          (docSnapshot) => {
            if (docSnapshot.exists()) {
              // Update the order status
              updateDoc(orderRef, { status: newStatus })
                .then(() => {
                  if (isMain == true) {
                    updateOrderState(selectedOrder.id);
                  }
                  resolve("Order status updated successfully");
                })
                .catch((error) => {
                  reject(error);
                });
            } else {
              reject("Order does not exist");
            }
          },
          (error) => {
            reject(error);
          }
        );

        // Optionally returning unsubscribe function for cleanup if needed
        // return unsubscribe;
      } catch (error) {
        reject(error);
      }
    });
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
            Close order -- {selectedOrder.docId} + {selectedOrder.symbol}
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
                  type="number"
                  className="form-control border-1 border-black rounded-0 input-number"
                  id="staticEmail"
                />
              </div>
            </div>
          )}
          <div className="ps-3 fs-5">
            Current Price: <span className="ms-2 text-success">{price}</span>
          </div>
          <div className="w-100 text-center my-2">
            <button
              className="modal-close-btn btn btn-success fs-5 rounded-4 mx-auto"
              onClick={() => {
                updateOrderStatus(selectedOrder.docId, "Closed");
                onClose();
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
