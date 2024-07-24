import {
  getDocument,
  incrementLastAccountNo,
  updateUserById,
} from "../utills/firebaseHelpers";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";

const CreateAccountModal = ({ onClose, userProfile } = {}) => {
  const [accountNo, setAccountNo] = useState("");
  const [accountType, setAccountType] = useState("Standard");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLastAccount = async () => {
      const { lastAccountNo } = await getDocument(
        "configs",
        "8VaY8WzBNUl6Ca8KbpWD"
      );
      if (!lastAccountNo)
        return toast.error("Error fetching last account number");
      setAccountNo(+lastAccountNo + 1);
      setIsLoading(false);
    };
    fetchLastAccount();
  }, []);

  const createNewAccount = async () => {
    if (
      userProfile?.accounts?.length === 2 &&
      userProfile?.accounts?.find((a) => !a.isDeleted)
    )
      return toast.error("You have reached max account limit");
    try {
      setIsLoading(true);
      const accounts =
        userProfile?.accounts?.map((account) => ({
          ...account,
          isDefault: false,
        })) || [];
      accounts.push({
        account_no: accountNo,
        account_type: accountType,
        activeOrdersProfit: 0,
        activeOrdersSwap: 0,
        bonus: 0,
        bonusSpent: 0,
        isDefault: true,
        isDeleted: false,
        totalBalance: 0,
        totalMargin: 0,
      });
      await updateUserById(userProfile.id, { accounts });
      await incrementLastAccountNo();
      toast.success("Account created successfully");
      onClose();
    } catch (e) {
      toast.error("Error in creating account number");
      console.log("Error", e);
      setIsLoading(false);
    }
  };

  return (
    <Modal centered onHide={onClose} show>
      <Modal.Header closeButton>Create an account</Modal.Header>
      <Modal.Body>
        <div className="d-flex justify-content-center align-items-baseline gap-2">
          <label>Type:</label>
          <div className="d-flex gap-4">
            <div className="form-check form-check-inline">
              <input
                checked={accountType === "Standard"}
                className="form-check-input"
                id="inlineRadio1"
                name="inlineRadioOptions"
                onChange={() => setAccountType("Standard")}
                type="radio"
              />
              <label htmlFor="inlineRadio1">Standard</label>
            </div>
            <div className="form-check form-check-inline">
              <input
                checked={accountType === "Islamic"}
                className="form-check-input"
                id="inlineRadio2"
                name="inlineRadioOptions"
                onChange={() => setAccountType("Islamic")}
                type="radio"
              />
              <label htmlFor="inlineRadio2">Islamic</label>
            </div>
          </div>
        </div>
        <div className="fs-5 my-2">
          Account Number:
          <span className="ms-2 text-success">{accountNo || "Loading..."}</span>
        </div>
        <div className="text-center my-4">
          <button
            className="btn btn-success"
            disabled={isLoading}
            onClick={createNewAccount}
          >
            Create account
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default CreateAccountModal;
