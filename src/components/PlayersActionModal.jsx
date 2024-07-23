import { Modal } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useState } from "react";
import AddBalanceModal from "./AddBalanceModal";
import ChangeManagerModal from "./ChangeManagerModal";
import CreateAccountModal from "./CreateAccountModal";
import CreatePlayerModal from "./CreatePlayerModal";
import ReportModal from "./ReportModal";
import TradingSettings from "./TradingSettings";

const PlayersActionModal = ({
  closePlayersActionModal,
  modalPosition,
  selectedUser,
} = {}) => {
  const orders = useSelector((state) => state.orders);

  // const [showModal, setShowModal] = useState(true);

  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showChangeManagerModal, setShowChangeManagerModal] = useState(false);
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showTradingSettingsModal, setShowTradingSettingsModal] =
    useState(false);

  const close = () => {
    closePlayersActionModal(false);
  };

  const accounts = selectedUser.accounts || [];
  const defaultAccount = accounts.find((account) => account.isDefault) || {};

  const activeOrdersProfit =
    parseFloat(defaultAccount?.activeOrdersProfit) || 0;
  const activeOrdersSwap = parseFloat(defaultAccount?.activeOrdersSwap) || 0;
  const allowBonus = selectedUser.settings?.allowBonus;
  const bonus = parseFloat(defaultAccount?.bonus) || 0;
  const bonusSpent = parseFloat(defaultAccount?.bonusSpent) || 0;
  const totalMargin = parseFloat(defaultAccount?.totalMargin);

  const pendingOrders = orders.filter(
    (order) =>
      order.status === "Pending" &&
      order.account_no === defaultAccount?.account_no
  );

  const calculateEquity = () => {
    let equity =
      parseFloat(defaultAccount?.totalBalance) +
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

  const totalBalance = freeMargin + totalMargin + bonus;

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
              // setShowModal(false);
              setShowReportModal(true);
            }}
          >
            Report
          </p>
          <p
            onClick={() => {
              // setShowModal(false);
              setShowChangeManagerModal(true);
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
      {showReportModal && (
        <ReportModal
          balance={totalBalance}
          bonus={bonus}
          bonusSpent={bonusSpent}
          onClose={() => {
            setShowReportModal(false);
          }}
          userId={selectedUser.userId}
        />
      )}
      {showChangeManagerModal && (
        <ChangeManagerModal setShowModal={setShowChangeManagerModal} />
      )}
    </>
  );
};

export default PlayersActionModal;
