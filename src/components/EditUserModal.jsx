import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { useSelector } from "react-redux";

const EditUserModal = ({ show, onClose }) => {
  const user = useSelector((state) => state?.user?.user);
  const [userData, setUserData] = useState({
    name: user.name,
    email: user.email,
  });

  const handleOnChange = (e) => {};
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div>
      <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>Edit User</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <div className="row">
                <div className="col-md-3">
                  <label className="form-label">Name</label>
                </div>
                <div className="col-md-9">
                  <input
                    type="text"
                    name="name"
                    onChange={handleOnChange}
                    value={userData?.name}
                    className="form-control"
                  />
                </div>
              </div>
            </div>
            <div className="mb-3">
              <div className="row">
                <div className="col-md-3">
                  <label className="form-label">Email</label>
                </div>
                <div className="col-md-9">
                  <input
                    disabled={true}
                    className="form-control"
                    type="email"
                    name="email"
                    onChange={handleOnChange}
                    value={userData?.email}
                  />
                </div>
              </div>
            </div>
            <div className="mb-3">
              <button type="submit" className="btn btn-primary">
                Save
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EditUserModal;
