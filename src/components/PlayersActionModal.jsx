import { useState } from "react";
import { Modal } from "react-bootstrap";
import CreateAccountModal from "./CreateAccountModal";
import CreatePlayerModal from "./CreatePlayerModal";
import TradingSettings from "./TradingSettings";
import AddBalanceModal from "./AddBalanceModal";

const PlayersActionModal = ({
  closePlayersActionModal,
  modalPosition,
  selectedUser,
} = {}) => {
  // const [showModal, setShowModal] = useState(true);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [showTradingSettingsModal, setShowTradingSettingsModal] =
    useState(false);

  const close = () => {
    closePlayersActionModal(false);
  };

  return (
    <>
      <Modal
        animation
        backdropClassName="opacity-0"
        dialogClassName={"position-absolute"}
        onHide={close}
        show
        size="sm"
        style={{
          left: modalPosition.x,
          top: modalPosition.y,
          // visibility: showModal ? "" : "hidden",
        }}
      >
        <Modal.Body className="players-action">
          <p
            onClick={() => {
              // setShowModal(false);
              setShowNewAccountModal(true);
            }}
          >
            New account
          </p>
          <p
            onClick={() => {
              // setShowModal(false);
              setShowEditAccountModal(true);
            }}
          >
            Edit account
          </p>
          <p
            onClick={() => {
              // setShowModal(false);
              setShowTradingSettingsModal(true);
            }}
          >
            Trading settings
          </p>
          <p
            onClick={() => {
              // setShowModal(false);
              setShowBalanceModal(true);
            }}
          >
            Deposit-Withdraw
          </p>
          <p
            onClick={() => {
              close();
            }}
          >
            Report
          </p>
          <p
            onClick={() => {
              close();
            }}
          >
            Change manager
          </p>
          <p
            onClick={() => {
              close();
            }}
          >
            Delete account
          </p>
        </Modal.Body>
      </Modal>
      {showNewAccountModal && (
        <CreateAccountModal
          onClose={() => {
            setShowNewAccountModal(false);
          }}
          userProfile={selectedUser}
        />
      )}
      {showEditAccountModal && (
        <CreatePlayerModal
          playerAccount={selectedUser}
          setShowModal={setShowEditAccountModal}
        />
      )}
      {showTradingSettingsModal && (
        <TradingSettings setShowModal={setShowTradingSettingsModal} />
      )}
      {showBalanceModal && (
        <AddBalanceModal setShowModal={setShowBalanceModal} />
      )}
    </>
  );
};

export default PlayersActionModal;
