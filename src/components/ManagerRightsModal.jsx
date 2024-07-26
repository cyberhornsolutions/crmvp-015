import React, { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { updateManager } from "../utills/firebaseHelpers";

const ManagerRightsModal = ({ setShowModal, manager }) => {
  const [settings, setSettings] = useState({
    createPlayer: Boolean(manager?.settings?.createPlayer),
    editPlayer: Boolean(manager?.settings?.editPlayer),
    deletePlayerAccount: Boolean(manager?.settings?.deletePlayerAccount),
    trade: Boolean(manager?.settings?.trade),
    depositWithdraw: Boolean(manager?.settings?.depositWithdraw),
    editSymbol: Boolean(manager?.settings?.editSymbol),
    createSymbolGroup: Boolean(manager?.settings?.createSymbolGroup),
    createManager: Boolean(manager?.settings?.createManager),
    editManager: Boolean(manager?.settings?.editManager),
    disableManager: Boolean(manager?.settings?.disableManager),
    createTeam: Boolean(manager?.settings?.createTeam),
    createEditStatus: Boolean(manager?.settings?.createEditStatus),
    disableStatus: Boolean(manager?.settings?.disableStatus),
  });

  const [loading, setLoading] = useState(false);

  const closeModal = () => setShowModal(false);

  const handleChange = (e) =>
    setSettings((p) => ({ ...p, [e.target.name]: e.target.checked }));

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);
      await updateManager(manager.id, { settings });
      toast.success("Saved Successfully");
      closeModal();
    } catch (error) {
      console.log(error);
      toast.success("Failed to save settings");
    }
    setLoading(false);
  };

  return (
    <>
      <Modal size="md" show onHide={closeModal} centered>
        <Modal.Header closeButton>
          <h5 className="m-0">Rights management</h5>
        </Modal.Header>
        <Modal.Body className="">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="row align-items-center justify-content-center mb-1">
              <div className="col-8 text-left">
                <Form.Label htmlFor="create-account">
                  Create an account for Player
                </Form.Label>
              </div>
              <div className="col-auto">
                <Form.Check
                  id="create-account"
                  name="createPlayer"
                  checked={settings.createPlayer}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>
            <Form.Group className="row align-items-center justify-content-center mb-1">
              <div className="col-8 text-left">
                <Form.Label htmlFor="edit-account">Edit account</Form.Label>
              </div>
              <div className="col-auto">
                <Form.Check
                  id="edit-account"
                  name="editPlayer"
                  checked={settings.editPlayer}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>
            <Form.Group className="row align-items-center justify-content-center mb-1">
              <div className="col-8 text-left">
                <Form.Label htmlFor="delete-account">Delete account</Form.Label>
              </div>
              <div className="col-auto">
                <Form.Check
                  id="delete-account"
                  name="deletePlayerAccount"
                  checked={settings.deletePlayerAccount}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>
            <Form.Group className="row align-items-center justify-content-center mb-1">
              <div className="col-8 text-left">
                <Form.Label htmlFor="trade">Trade</Form.Label>
              </div>
              <div className="col-auto">
                <Form.Check
                  id="trade"
                  name="trade"
                  checked={settings.trade}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>
            <Form.Group className="row align-items-center justify-content-center mb-1">
              <div className="col-8 text-left">
                <Form.Label htmlFor="deposit-withdraw">
                  Deposit-WIthdraw
                </Form.Label>
              </div>
              <div className="col-auto">
                <Form.Check
                  id="deposit-withdraw"
                  name="depositWithdraw"
                  checked={settings.depositWithdraw}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>
            <Form.Group className="row align-items-center justify-content-center mb-1">
              <div className="col-8 text-left">
                <Form.Label htmlFor="edit-symbols">Edit symbols</Form.Label>
              </div>
              <div className="col-auto">
                <Form.Check
                  id="edit-symbols"
                  name="editSymbol"
                  checked={settings.editSymbol}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>
            <Form.Group className="row align-items-center justify-content-center mb-1">
              <div className="col-8 text-left">
                <Form.Label htmlFor="change-group">
                  Create group of symbols
                </Form.Label>
              </div>
              <div className="col-auto">
                <Form.Check
                  id="change-group"
                  name="createSymbolGroup"
                  checked={settings.createSymbolGroup}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>
            <Form.Group className="row align-items-center justify-content-center mb-1">
              <div className="col-8 text-left">
                <Form.Label htmlFor="create-manager-account">
                  Create manager account
                </Form.Label>
              </div>
              <div className="col-auto">
                <Form.Check
                  id="create-manager-account"
                  name="createManager"
                  checked={settings.createManager}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>
            <Form.Group className="row align-items-center justify-content-center mb-1">
              <div className="col-8 text-left">
                <Form.Label htmlFor="edit-manager-account">
                  Edit manager account
                </Form.Label>
              </div>
              <div className="col-auto">
                <Form.Check
                  id="edit-manager-account"
                  name="editManager"
                  checked={settings.editManager}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>
            <Form.Group className="row align-items-center justify-content-center mb-1">
              <div className="col-8 text-left">
                <Form.Label htmlFor="disable-manager-account">
                  Disable manager account
                </Form.Label>
              </div>
              <div className="col-auto">
                <Form.Check
                  id="disable-manager-account"
                  name="disableManager"
                  checked={settings.disableManager}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>
            <Form.Group className="row align-items-center justify-content-center mb-1">
              <div className="col-8 text-left">
                <Form.Label htmlFor="create-team">Create team</Form.Label>
              </div>
              <div className="col-auto">
                <Form.Check
                  id="create-team"
                  name="createTeam"
                  checked={settings.createTeam}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>
            <Form.Group className="row align-items-center justify-content-center mb-1">
              <div className="col-8 text-left">
                <Form.Label htmlFor="create-edit-status">
                  Create/Edit status
                </Form.Label>
              </div>
              <div className="col-auto">
                <Form.Check
                  id="create-edit-status"
                  name="createEditStatus"
                  checked={settings.createEditStatus}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>
            <Form.Group className="row align-items-center justify-content-center mb-3">
              <div className="col-8 text-left">
                <Form.Label htmlFor="disable-status">Disable status</Form.Label>
              </div>
              <div className="col-auto">
                <Form.Check
                  id="disable-status"
                  name="disableStatus"
                  checked={settings.disableStatus}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>
            <div className="d-flex gap-3 align-items-center justify-content-center">
              <Button variant="secondary" className="w-25" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="w-25"
                disabled={loading}
              >
                Save
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ManagerRightsModal;
