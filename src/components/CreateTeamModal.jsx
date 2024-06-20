import React, { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { updateUserById } from "../utills/firebaseHelpers";
import { useSelector } from "react-redux";

const CreateTeamModal = ({ setShowModal }) => {
  const [team, setTeam] = useState({
    name: "",
    desk: "main",
  });
  const [loading, setLoading] = useState(false);

  const closeModal = () => setShowModal(false);

  const handleChange = (e) =>
    setManager((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    // setLoading(true);
    // const userPayload = { settings };
    // try {
    //   await updateUserById(selectedUser.userId, userPayload);
    //   toast.success("Trading settings saved successfully");
    //   closeModal();
    // } catch (error) {
    //   toast.error("Failed to save trading settings!");
    //   console.log(error.message);
    //   setLoading(false);
    // }
  };

  return (
    <>
      <Modal size="md" show onHide={closeModal} centered>
        <Modal.Header closeButton>
          <h5 className="m-0">Create Team</h5>
        </Modal.Header>
        <Modal.Body className="px-4">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="row align-items-center mb-3">
              <div className="col-5 text-left">
                <Form.Label htmlFor="login">Name</Form.Label>
              </div>
              <div className="col">
                <Form.Control
                  id="name"
                  name="name"
                  placeholder="Name"
                  required
                  value={team.name}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>
            <Form.Group className="row align-items-center mb-3">
              <div className="col-5 text-left">
                <Form.Label htmlFor="desk">Desk</Form.Label>
              </div>
              <div className="col">
                <Form.Select
                  id="desk"
                  name="desk"
                  required
                  value={team.desk}
                  onChange={handleChange}
                >
                  <option value="main">Main</option>
                  <option value="demo">Demo</option>
                </Form.Select>
              </div>
            </Form.Group>
            <Button type="submit" className="w-100" disabled={loading}>
              Create
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CreateTeamModal;
