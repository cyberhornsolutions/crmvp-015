import React, { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { addDocument } from "../utills/firebaseHelpers";
import { serverTimestamp } from "firebase/firestore";
import { useSelector } from "react-redux";
const CreateTeamModal = ({ setShowModal }) => {
  const user = useSelector((state) => state.user?.user);
  const [team, setTeam] = useState({
    name: "",
    desk: "Main",
  });
  const [loading, setLoading] = useState(false);

  const closeModal = () => setShowModal(false);

  const handleChange = (e) =>
    setTeam((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (let k in team)
      if (!team[k]) return toast.error("Please fill all field");

    try {
      setLoading(true);
      const date = serverTimestamp();
      const payload = {
        ...team,
        createdAt: date,
        updatedAt: date,
        createdBy: user.id,
      };
      await addDocument("teams", payload);
      toast.success("Team created successfully");
      closeModal();
    } catch (error) {
      toast.error("Failed to create team");
      console.log(error.message);
      setLoading(false);
    }
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
                  <option value="Main">Main</option>
                  <option value="Demo">Demo</option>
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
