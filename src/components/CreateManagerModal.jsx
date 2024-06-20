import React, { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { addDocument } from "../utills/firebaseHelpers";
import { useSelector } from "react-redux";
import { serverTimestamp } from "firebase/firestore";

const CreateManagerModal = ({ setShowModal }) => {
  const teams = useSelector((state) => state.teams);
  console.log("teams = ", teams);
  const [manager, setManager] = useState({
    login: "",
    name: "",
    surname: "",
    password: "",
    repeatPassword: "",
    email: "",
    role: "Sale",
    team: teams[0]?.id || "",
  });
  const [loading, setLoading] = useState(false);

  const closeModal = () => setShowModal(false);

  const handleChange = (e) =>
    setManager((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (let k in manager)
      if (!manager[k]) return toast.error("Please fill all field");
    if (manager.password !== manager.repeatPassword)
      return toast.error("Password not matched");

    try {
      setLoading(true);
      const date = serverTimestamp();
      const payload = {
        ...manager,
        username: manager.login,
        isActive: true,
        date,
        updatedAt: date,
      };
      ["login", "repeatPassword"].forEach((k) => delete payload[k]);
      await addDocument("managers", payload);
      toast.success("Manager created successfully");
      closeModal();
    } catch (error) {
      toast.error("Failed to create manager");
      console.log(error.message);
      setLoading(false);
    }
  };

  return (
    <>
      <Modal size="md" show onHide={closeModal} centered>
        <Modal.Header closeButton>
          <h5 className="m-0">Create Manager</h5>
        </Modal.Header>
        <Modal.Body className="px-4">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="row align-items-center mb-3">
              <div className="col-5 text-left">
                <Form.Label htmlFor="login">Login</Form.Label>
              </div>
              <div className="col">
                <Form.Control
                  id="login"
                  name="login"
                  // type="number"
                  // min={1}
                  // max={100}
                  placeholder="Login"
                  required
                  value={manager.login}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>
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
                  value={manager.name}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>
            <Form.Group className="row align-items-center mb-3">
              <div className="col-5 text-left">
                <Form.Label htmlFor="login">Surname</Form.Label>
              </div>
              <div className="col">
                <Form.Control
                  id="surname"
                  name="surname"
                  placeholder="Surname"
                  required
                  value={manager.surname}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>
            <Form.Group className="row align-items-center mb-3">
              <div className="col-5 text-left">
                <Form.Label htmlFor="login">Password</Form.Label>
              </div>
              <div className="col">
                <Form.Control
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                  value={manager.password}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>
            <Form.Group className="row align-items-center mb-3">
              <div className="col-5 text-left">
                <Form.Label htmlFor="login">Repeat Password</Form.Label>
              </div>
              <div className="col">
                <Form.Control
                  id="repeatPassword"
                  name="repeatPassword"
                  type="password"
                  placeholder="Repeat Password"
                  required
                  value={manager.repeatPassword}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>
            <Form.Group className="row align-items-center mb-3">
              <div className="col-5 text-left">
                <Form.Label htmlFor="login">Email</Form.Label>
              </div>
              <div className="col">
                <Form.Control
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  value={manager.email}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>
            <Form.Group className="row align-items-center mb-3">
              <div className="col-5 text-left">
                <Form.Label htmlFor="group">Role</Form.Label>
              </div>
              <div className="col">
                <Form.Select
                  id="role"
                  name="role"
                  required
                  value={manager.role}
                  onChange={handleChange}
                >
                  <option value="Sale">Sale</option>
                  <option value="Reten">Reten</option>
                  <option value="Admin">Admin</option>
                </Form.Select>
              </div>
            </Form.Group>
            <Form.Group className="row align-items-center mb-3">
              <div className="col-5 text-left">
                <Form.Label htmlFor="group">Team</Form.Label>
              </div>
              <div className="col">
                <Form.Select
                  id="team"
                  name="team"
                  required
                  value={manager.team}
                  onChange={handleChange}
                >
                  {teams.map((team, i) => (
                    <option key={i} value={team.id}>
                      {team.name}
                    </option>
                  ))}
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

export default CreateManagerModal;
