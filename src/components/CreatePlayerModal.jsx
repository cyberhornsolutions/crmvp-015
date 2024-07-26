import React, { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { getManagerSettings } from "../utills/helpers";

const CreatePlayerModal = ({ playerAccount, setShowModal }) => {
  const account = playerAccount || undefined;
  const user = useSelector((state) => state?.user?.user);
  const managers = useSelector((state) => state.managers);
  const managerSettings = getManagerSettings(managers, user.id);
  const [player, setPlayer] = useState(
    account
      ? {
          name: account.name,
          surname: account.surname,
          email: account.email,
          password: account.password,
          phone: account.phone,
          country: account.country,
          city: account.city,
        }
      : {
          name: "",
          surname: "",
          email: "",
          password: "",
          repeatPassword: "",
          phone: "",
          country: "",
          city: "",
          useRefCode: "",
        }
  );
  const [loading, setLoading] = useState(false);

  const closeModal = () => setShowModal(false);

  const handleChange = (e) =>
    setPlayer((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (account) {
      setLoading(true);
      const keys = [
        "name",
        "surname",
        "email",
        "phone",
        "password",
        "country",
        "city",
      ];
      const unChanged = keys.every((key) => {
        return account[key] === player[key];
      });
      if (unChanged) {
        closeModal();
        return;
      }
      for (let key of keys.slice(0, 5)) {
        if (!player[key]) {
          toast.error(`${key} can't be empty`);
          closeModal();
          return;
        }
      }
      try {
        const userDocRef = doc(db, "users", account.userId);
        await updateDoc(userDocRef, player);
        toast.success("Player edited successfully");
        closeModal();
      } catch {
        toast.error("Failed to edit player");
        setLoading(false);
      }
      return;
    }

    for (let k in player)
      if (!player[k] && k !== "useRefCode")
        return toast.error("Please fill all field");
    if (player.password.length < 6)
      return toast.error("Password should be at least 6 characters long");
    if (player.password !== player.repeatPassword)
      return toast.error("Password not matched");
    try {
      setLoading(true);
      const date = serverTimestamp();
      const payload = {
        ...player,
        manager: user.id,
        createdAt: date,
        updatedAt: date,
        allowTrading: true,
        status: "New",
        refCode: "",
        onlineStatus: false,
        role: "user",
        isUserEdited: false,
        // quotes
      };
      ["repeatPassword"].forEach((k) => delete payload[k]);
      const credentials = await createUserWithEmailAndPassword(
        auth,
        payload.email,
        payload.password
      );
      await setDoc(doc(db, "users", credentials.user.uid), payload);
      toast.success("Player created successfully");
      closeModal();
    } catch (error) {
      toast.error("Failed to create player" + error.message);
      console.log(error.message);
      setLoading(false);
    }
  };

  return (
    <>
      <Modal size="md" show onHide={closeModal} centered>
        <Modal.Header closeButton>
          <h5 className="m-0">{account ? "Edit Player" : "Create Player"}</h5>
        </Modal.Header>
        <Modal.Body className="px-4">
          {managerSettings?.editPlayer ? (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="row align-items-center mb-3">
                <div className="col-5 text-left">
                  <Form.Label htmlFor="name">Name</Form.Label>
                </div>
                <div className="col">
                  <Form.Control
                    id="name"
                    name="name"
                    placeholder="Name"
                    required={!account}
                    value={player.name}
                    onChange={handleChange}
                  />
                </div>
              </Form.Group>
              <Form.Group className="row align-items-center mb-3">
                <div className="col-5 text-left">
                  <Form.Label htmlFor="surname">Surname</Form.Label>
                </div>
                <div className="col">
                  <Form.Control
                    id="surname"
                    name="surname"
                    placeholder="Surname"
                    required={!account}
                    value={player.surname}
                    onChange={handleChange}
                  />
                </div>
              </Form.Group>
              <Form.Group className="row align-items-center mb-3">
                <div className="col-5 text-left">
                  <Form.Label htmlFor="email">Email</Form.Label>
                </div>
                <div className="col">
                  <Form.Control
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    required={!account}
                    value={player.email}
                    onChange={handleChange}
                  />
                </div>
              </Form.Group>
              <Form.Group className="row align-items-center mb-3">
                <div className="col-5 text-left">
                  <Form.Label htmlFor="password">Password</Form.Label>
                </div>
                <div className="col">
                  <Form.Control
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Password"
                    required={!account}
                    value={player.password}
                    onChange={handleChange}
                  />
                </div>
              </Form.Group>
              {!account && (
                <Form.Group className="row align-items-center mb-3">
                  <div className="col-5 text-left">
                    <Form.Label htmlFor="repeatPassword">
                      Repeat Password
                    </Form.Label>
                  </div>
                  <div className="col">
                    <Form.Control
                      id="repeatPassword"
                      name="repeatPassword"
                      type="password"
                      placeholder="Repeat Password"
                      required
                      value={player.repeatPassword}
                      onChange={handleChange}
                    />
                  </div>
                </Form.Group>
              )}
              <Form.Group className="row align-items-center mb-3">
                <div className="col-5 text-left">
                  <Form.Label htmlFor="phone">Phone</Form.Label>
                </div>
                <div className="col">
                  <Form.Control
                    id="phone"
                    name="phone"
                    type="text"
                    placeholder="Phone"
                    required={!account}
                    value={player.phone}
                    onChange={handleChange}
                  />
                </div>
              </Form.Group>
              <Form.Group className="row align-items-center mb-3">
                <div className="col-5 text-left">
                  <Form.Label htmlFor="country">Country</Form.Label>
                </div>
                <div className="col">
                  <Form.Control
                    id="country"
                    name="country"
                    type="text"
                    placeholder="Country"
                    required={!account}
                    value={player.country}
                    onChange={handleChange}
                  />
                </div>
              </Form.Group>
              <Form.Group className="row align-items-center mb-3">
                <div className="col-5 text-left">
                  <Form.Label htmlFor="city">City</Form.Label>
                </div>
                <div className="col">
                  <Form.Control
                    id="city"
                    name="city"
                    type="text"
                    placeholder="City"
                    required={!account}
                    value={player.city}
                    onChange={handleChange}
                  />
                </div>
              </Form.Group>
              {!account && (
                <Form.Group className="row align-items-center mb-3">
                  <div className="col-5 text-left">
                    <Form.Label htmlFor="refCode">Referral code</Form.Label>
                  </div>
                  <div className="col">
                    <Form.Control
                      id="refCode"
                      name="refCode"
                      type="text"
                      placeholder="Referral Code"
                      value={player.useRefCode}
                      onChange={handleChange}
                    />
                  </div>
                </Form.Group>
              )}
              <Button type="submit" className="w-100" disabled={loading}>
                {account ? "Save" : "Create"}
              </Button>
            </Form>
          ) : (
            "You do not have permission to perform this action."
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CreatePlayerModal;
