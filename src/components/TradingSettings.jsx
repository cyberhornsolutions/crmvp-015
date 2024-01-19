import React, { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { updateUserById } from "../utills/firebaseHelpers";
import { useSelector } from "react-redux";

const TradingSettings = ({ setShowModal }) => {
  const { selectedUser } = useSelector((state) => state.user);
  const [settings, setSettings] = useState({
    group: selectedUser?.settings?.group || "general",
    leverage: selectedUser?.settings?.leverage || "1",
    maintenanceMargin: selectedUser?.settings?.maintenanceMargin || "5",
    stopOut: selectedUser?.settings?.stopOut || "",
    minDeposit: selectedUser?.settings?.minDeposit || "",
    maxDeals: selectedUser?.settings?.maxDeals || "",
    allowBonus: selectedUser?.settings?.allowBonus || false,
  });
  const [loading, setLoading] = useState(false);

  const closeModal = () => setShowModal(false);

  const handleChange = (e) =>
    setSettings((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserById(selectedUser.id, { settings });
      toast.success("Trading settings saved successfully");
      closeModal();
    } catch (error) {
      toast.error("Failed to save trading settings!");
      console.log(error.message);
      setLoading(false);
    }
  };

  return (
    <>
      <Modal size="md" show onHide={closeModal} centered>
        <Modal.Header closeButton>
          <h5 className="m-0">Trading settings</h5>
        </Modal.Header>
        <Modal.Body className="px-4">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="row align-items-center mb-3">
              <div className="col-5 text-left">
                <Form.Label htmlFor="group">Group</Form.Label>
              </div>
              <div className="col">
                <Form.Select
                  id="group"
                  placeholder="Group"
                  required
                  value={settings.group}
                  onChange={handleChange}
                >
                  <option value="general">General</option>
                  <option value="special">Special</option>
                </Form.Select>
              </div>
            </Form.Group>
            <Form.Group className="row align-items-center mb-3">
              <div className="col-5 text-left">
                <Form.Label htmlFor="leverage">Leverage</Form.Label>
              </div>
              <div className="col">
                <Form.Control
                  id="leverage"
                  name="leverage"
                  type="number"
                  min={1}
                  max={100}
                  placeholder="Leverage"
                  required
                  value={settings.leverage}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>
            <Form.Group className="row align-items-center mb-3">
              <div className="col-5 text-left">
                <Form.Label htmlFor="maintenance-margin">
                  Maintenance margin
                </Form.Label>
              </div>
              <div className="col">
                <Form.Control
                  id="maintenance-margin"
                  name="maintenanceMargin"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={5}
                  placeholder="Maintenance margin"
                  required
                  value={settings.maintenanceMargin}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>
            <Form.Group className="row align-items-center mb-3">
              <div className="col-5 text-left">
                <Form.Label htmlFor="stop-out">Stop-out</Form.Label>
              </div>
              <div className="col">
                <Form.Control
                  id="stop-out"
                  name="stopOut"
                  type="number"
                  min={1}
                  placeholder="Stop-out"
                  required
                  value={settings.stopOut}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>
            <Form.Group className="row align-items-center mb-3">
              <div className="col-5 text-left">
                <Form.Label htmlFor="min-deposit">Min deposit</Form.Label>
              </div>
              <div className="col">
                <Form.Control
                  id="min-deposit"
                  name="minDeposit"
                  type="number"
                  min={1}
                  placeholder="Min deposit"
                  required
                  value={settings.minDeposit}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>
            <Form.Group className="row align-items-center mb-3">
              <div className="col-5 text-left">
                <Form.Label htmlFor="max-deals">Max deals</Form.Label>
              </div>
              <div className="col">
                <Form.Control
                  id="max-deals"
                  name="maxDeals"
                  type="number"
                  min={1}
                  placeholder="Max deals"
                  required
                  value={settings.maxDeals}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>
            <Form.Check
              id="allow-bonus"
              name="allowBonus"
              className="mb-3"
              label="Allow using bonus"
              inline
              reverse
              checked={settings.allowBonus}
              onChange={(e) =>
                setSettings((p) => ({ ...p, allowBonus: e.target.checked }))
              }
            />
            <Button type="submit" className="w-100" disabled={loading}>
              Save
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default TradingSettings;
