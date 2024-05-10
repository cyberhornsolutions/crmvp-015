import React, { useEffect, useRef, useState, useCallback } from "react";
import placeholder from "../acc-img-placeholder.png";
import { Nav, Navbar, ProgressBar } from "react-bootstrap";
import { db } from "../firebase";
import { getAllSymbols, getAllDeposits } from "../utills/firebaseHelpers";
import { onSnapshot, doc, updateDoc } from "firebase/firestore";
import ImageModal from "./ImageModal";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import DelOrderModal from "./DelOrderModal";
import CancelOrderModal from "./CancelOrderModal";
import EditOrder from "./EditOrder";
import { useDispatch, useSelector } from "react-redux";
import { setSymbolsState } from "../redux/slicer/symbolsSlicer";
import { setSelectedUser } from "../redux/slicer/userSlice";
import { setDepositsState } from "../redux/slicer/transactionSlicer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import EditUserModal from "./EditUserModal";
import AddBalanceModal from "./AddBalanceModal";
import dealsColumns from "./columns/dealsColumns";
import delayedColumns from "./columns/delayedColumns";
import overviewColumns from "./columns/overviewColumns";
import depositsColumns from "./columns/depositsColumns";
import { fillArrayWithEmptyRows } from "../utills/helpers";
import moment from "moment";
import SelectColumnsModal from "./SelectColumnsModal";

const overviewColumnsNames = overviewColumns().reduce(
  (p, { name }) => ({ ...p, [name]: true }),
  {}
);

const dealsColumnsNames = dealsColumns().reduce(
  (p, { name }) => ({ ...p, [name]: true }),
  {}
);

const delayedColumnsNames = delayedColumns().reduce(
  (p, { name }) => ({ ...p, [name]: true }),
  {}
);

export default function MainBoard() {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders);
  const [userOrders, setUserOrders] = useState([]);
  const columns = useSelector((state) => state?.columns);
  const { selectedUser } = useSelector((state) => state?.user);
  const deposits = useSelector((state) =>
    state.deposits.filter(({ userId }) => userId === selectedUser.id)
  );
  const [tab, setTab] = useState("info");
  const idInputRef = useRef(null);
  const locationInputRef = useRef(null);
  const mapInputRef = useRef(null);
  const placeInputRef = useRef(null);
  const [passwordShown, setPasswordShown] = useState(false);
  const [isBalOpen, setIsBalOpen] = useState(false);
  const [idFiles, setIdFiles] = useState([]);
  const [locationFiles, setLocationFiles] = useState([]);
  const [mapFiles, setMapFiles] = useState([]);
  const [placeFiles, setPlaceFiles] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isInfoEdit, setIsInfoEdit] = useState(false);
  const [newUserData, setNewUserData] = useState(selectedUser);
  const [isDelModalOpen, setIsDelModalOpen] = useState(false);
  const [showCancelOrderModal, setShowCancelOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState();
  const [isDealEdit, setIsDealEdit] = useState(false);
  const [closedOrders, setClosedOrders] = useState([]);
  const [isUserEdit, setIsUserEdit] = useState(false);
  const [showColumnsModal, setShowColumnsModal] = useState(false);
  const [showColumns, setShowColumns] = useState({});

  useEffect(() => {
    const _orders = orders.filter((o) => o.userId === selectedUser?.id);
    setUserOrders(_orders);
    const closed = _orders.filter(({ status }) => status !== "Pending");
    if (closed.length !== closedOrders.length) setClosedOrders(closed);
  }, [orders]);

  useEffect(() => {
    const unsubSelectedUser = getSelectedUserData();

    let cols;
    switch (tab) {
      case "overview":
        cols = columns.overviewColumns || overviewColumnsNames;
        break;
      case "deals":
        cols = columns.dealsColumns || dealsColumnsNames;
        break;
      case "delayed":
        cols = columns.delayedColumns || delayedColumnsNames;
        break;
      default:
        return;
    }
    const header = document.querySelector(".rdt_TableHead");
    if (!header) return;
    setShowColumns(cols);
    const handleRightClick = (e) => {
      e.preventDefault();
      setShowColumnsModal(true);
    };
    header.addEventListener("contextmenu", handleRightClick);
    return () => {
      header.removeEventListener("contextmenu", handleRightClick);
      unsubSelectedUser();
    };
  }, [tab]);

  const customStyles = {
    pagination: {
      style: {
        fontSize: "1rem",
        // minHeight: 28,
        // height: 28,
      },
    },
    headCells: {
      style: {
        fontSize: "1rem",
      },
    },
    rows: {
      style: {
        fontSize: "1rem",
        // minHeight: 36,
        // height: 36,
      },
    },
  };

  // const handleKeyPress = (event) => {
  //   const keyCode = event.keyCode || event.which;
  //   const keyValue = String.fromCharCode(keyCode);

  //   // Allow only numeric keys (0-9)
  //   if (!/^\d+$/.test(keyValue)) {
  //     event.preventDefault();
  //   }
  // };

  const handleImageClick = (image) => {
    console.log("Image", image);
    setSelectedImage(URL.createObjectURL(image));
    setModalShow(true);
  };

  const handleUploadClick = (inputRef) => {
    inputRef.current.click();
  };

  const handleFileChange = (e, fileStateSetter) => {
    const files = e.target.files;
    const fileArray = Array.from(files);
    fileStateSetter((prevFiles) => [...prevFiles, ...fileArray]);
  };

  const progressBarConfig = {
    New: { variant: "success", now: 25 },
    InProgress: { variant: "info", now: 50 },
    Confirmed: { variant: "warning", now: 75 },
    Closed: { variant: "danger", now: 100 },
  };

  const getSelectedUserData = () => {
    const userDocRef = doc(db, "users", selectedUser.id);
    const unsubscribe = onSnapshot(
      userDocRef,
      (userDocSnapshot) => {
        if (userDocSnapshot.exists()) {
          const userData = {
            id: userDocSnapshot.id,
            ...userDocSnapshot.data(),
          };
          dispatch(setSelectedUser(userData));
          setNewUserData(userData);
        } else {
          console.error("User ID does not exist in the database.");
        }
      },
      (error) => {
        console.error("Error fetching user:", error);
      }
    );
    return unsubscribe;
  };

  const saveClosedOrders = async () => {
    let profit = 0;
    for (let i = 0; i < closedOrders.length; i++) {
      if (closedOrders[i].sum <= 0)
        return toast.error("Sum value should be greater than 0");
      if (closedOrders[i].symbolValue <= 0)
        return toast.error("Open Price value should be greater than 0");
      if (!closedOrders[i].profit)
        return toast.error("Please enter profit value in all deals");
      profit += +closedOrders[i].profit;
    }
    if (profit < 0) {
      const eq = +equity + profit;
      if (eq < 0) return toast.error("This profit makes equity less than 0");
      if (eq < parseFloat(newUserData?.settings?.stopOut))
        return toast.error("This profit makes equity less than stop out value");
    }
    let status = "success";
    closedOrders.forEach(async (order) => {
      const docRef = doc(db, "orders", order.id);
      try {
        await updateDoc(docRef, order);
        console.log(`Document with ID ${order.id} updated successfully`);
      } catch (error) {
        status = "error";
        console.error(`Error updating document with ID ${order.id}:`, error);
      }
    });
    toast[status]("Orders Updated");
    setIsEdit(false);
  };

  const updateUser = async () => {
    try {
      const userDocRef = doc(db, "users", newUserData.id);
      await updateDoc(userDocRef, newUserData);
      toast.success("Saved successfully");
    } catch (error) {
      console.log("error in updating user =", error);
    }
  };

  const handleUserInfoChange = (e) =>
    setNewUserData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleEditOverviewOrders = (id, field, value) => {
    const updatedData = closedOrders.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setClosedOrders(updatedData);
  };
  const handleEditOrder = (row) => {
    setSelectedOrder(row);
    setIsDealEdit(true);
  };
  const handleCloseOrder = (row) => {
    setSelectedOrder(row);
    setIsDelModalOpen(true);
  };
  const handleCancelOrder = (row) => {
    setSelectedOrder(row);
    setShowCancelOrderModal(true);
  };

  const handleClose = () => {
    setIsBalOpen(false);
    setIsDelModalOpen(false);
    setIsDealEdit(false);
    setIsUserEdit(false);
  };

  const referralUserColumns = [
    {
      name: "ID",
      selector: (row, i) => row && i + 1,
      sortable: true,
      width: "6%",
    },
    {
      name: "Registered",
      selector: (row) => row.createdAt,
      sortable: true,
      width: "10%",
    },
    {
      name: "Name",
      cell: (row) => (row.surname ? row.name + " " + row.surname : row.name),
      sortable: true,
      width: "8%",
    },
    {
      name: "Status",
      cell: (row) =>
        row && (
          <ProgressBar
            variant={progressBarConfig[row.status]?.variant}
            now={progressBarConfig[row.status]?.now}
            className="progressbar"
          />
        ),
      sortable: false,
      width: "8%",
    },
    {
      name: "Sale",
      selector: (row) => row && (row.sale ? row.sale : "New"),
      sortable: true,
      width: "8%",
    },
    {
      name: "Reten",
      selector: (row) => row && (row.reten ? row.reten : "New"),
      sortable: true,
      width: "8%",
    },
    {
      name: "Phone",
      selector: (row) => row && (row.phone ? row.phone : "12312321"),
      sortable: true,
      width: "8%",
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      width: "8%",
    },
    {
      name: "Balance",
      selector: (row) => row && (row.balance ? row.balance : "100"),
      sortable: true,
      width: "8%",
    },
    {
      name: "Deposit",
      selector: (row) => row && (row.deposit ? row.deposit : "50"),
      sortable: true,
      width: "8%",
    },
    {
      name: "Manager",
      selector: (row) => row && (row.manager ? row.manager : "Jhon"),
      sortable: true,
      width: "8%",
    },
    {
      name: "Affiliates",
      selector: (row) =>
        row && (row.affiliates ? row.affiliates : "Candy Land"),
      sortable: true,
      width: "8%",
    },
  ];

  const pendingOrders = userOrders?.filter(
    ({ status }) => status === "Pending"
  );

  const bonus = parseFloat(newUserData?.bonus);

  const activeOrders = pendingOrders.filter((order) => !order.enableOpenPrice);
  const delayedOrders = pendingOrders.filter((order) => order.enableOpenPrice);

  const activeOrdersProfit = parseFloat(newUserData?.activeOrdersProfit) || 0;
  const activeOrdersSwap = parseFloat(newUserData?.activeOrdersSwap) || 0;

  const calculateEquity = () => {
    let equity =
      parseFloat(newUserData?.totalBalance) +
      activeOrdersProfit -
      activeOrdersSwap;
    if (newUserData?.settings?.allowBonus) equity += bonus;
    return equity;
  };
  const equity = calculateEquity();
  const totalMargin = parseFloat(newUserData.totalMargin);

  const calculateFreeMargin = () => {
    const dealSum = pendingOrders.reduce((p, v) => p + +v.sum, 0);
    return equity - dealSum;
  };
  const freeMarginData = calculateFreeMargin();

  const totalBalance = freeMarginData + totalMargin + bonus;

  const userLevel = parseFloat(newUserData?.settings?.level) || 100;
  const level =
    totalMargin > 0 ? (equity / totalMargin) * (userLevel / 100) : 0;

  return (
    <div id="mainboard">
      <div id="profile">
        <img id="profile-pic" src={placeholder} alt="" />
        {/* <div id="profile-i">
          <h5 className="f-w-inherit f-s-inherit" style={{ lineHeight: 1.1 }}>
            {userOrders?.id}
          </h5>
          <h4
            id="lead-name"
            className="f-w-inherit f-s-inherit"
            style={{ lineHeight: 1.1 }}
          >
            {userOrders?.name}
          </h4>
        </div> */}
        <button
          className="btn btn-primary"
          onClick={() => {
            setIsUserEdit(true);
          }}
        >
          Edit
        </button>
        <div id="profile-deals">
          <h4 style={{ lineHeight: 1.1 }}>
            {/* Сделки */}
            Transactions
          </h4>
          <div id="sdelki-numbers">
            <div>
              <h5
                className="f-s-inherit  f-w-inherit "
                style={{ lineHeight: 1.1 }}
              >
                {pendingOrders.length}
              </h5>
              <h5
                className="f-s-inherit  f-w-inherit "
                style={{ lineHeight: 1.1 }}
              >
                {/* Открытые */}
                Open
              </h5>
            </div>
            <div>
              <h5
                className="f-s-inherit  f-w-inherit "
                style={{ lineHeight: 1.1 }}
              >
                {closedOrders.length}
              </h5>
              <h5
                className="f-s-inherit  f-w-inherit "
                style={{ lineHeight: 1.1 }}
              >
                {/* Закрытые */}
                Closed
              </h5>
            </div>
          </div>
        </div>
        <div id="profile-balance">
          <div>
            <div>
              <h5 className="text-left" style={{ lineHeight: 1.1 }}>
                {/* Баланс */}
                Balance
              </h5>
              <h4
                className="text-left f-w-inherit"
                style={{ lineHeight: 1.1 }}
                onClick={() => {
                  setIsBalOpen(true);
                }}
              >
                {+parseFloat(totalBalance)?.toFixed(2)}
              </h4>
            </div>
            <div>
              <h5 className="text-left" style={{ lineHeight: 1.1 }}>
                {/* Профит */}Profit
              </h5>
              <h4 className="text-left f-w-inherit" style={{ lineHeight: 1.1 }}>
                {+parseFloat(activeOrdersProfit)?.toFixed(2)}
              </h4>
            </div>
            <div>
              <h5 className="text-left" style={{ lineHeight: 1.1 }}>
                {/* Бонус */}
                Bonus
              </h5>
              <h4 className="text-left f-w-inherit" style={{ lineHeight: 1.1 }}>
                {+parseFloat(bonus)?.toFixed(2)}
              </h4>
            </div>
            <div>
              <h5 className="text-left" style={{ lineHeight: 1.1 }}>
                {/* Заведено */}
                Free
              </h5>
              <h4 className="text-left f-w-inherit" style={{ lineHeight: 1.1 }}>
                {+parseFloat(freeMarginData - bonus)?.toFixed(2)}
              </h4>
            </div>
            <div>
              <h5 className="text-left" style={{ lineHeight: 1.1 }}>
                {/* Заведено */}
                Deposited
              </h5>
              <h4 className="text-left f-w-inherit" style={{ lineHeight: 1.1 }}>
                {deposits
                  .filter(({ type }) => type === "Deposit")
                  .reduce((p, { sum }) => p + +sum, 0)}
              </h4>
            </div>
          </div>
          <div>
            <div>
              <h5 className="text-left" style={{ lineHeight: 1.1 }}>
                {/* Залог */}
                Margin
              </h5>
              <h4 className="text-left f-w-inherit" style={{ lineHeight: 1.1 }}>
                {+parseFloat(totalMargin)?.toFixed(2)}
              </h4>
            </div>
            <div>
              <h5 className="text-left" style={{ lineHeight: 1.1 }}>
                {/* Эквити */}
                Equity
              </h5>
              <h4 className="text-left f-w-inherit" style={{ lineHeight: 1.1 }}>
                {+parseFloat(equity)?.toFixed(2)}
              </h4>
            </div>
            <div>
              <h5 className="text-left" style={{ lineHeight: 1.1 }}>
                {/* Уровень маржи */}
                Free margin
              </h5>
              <h4 className="text-left f-w-inherit" style={{ lineHeight: 1.1 }}>
                {+parseFloat(freeMarginData)?.toFixed(2)}
              </h4>
            </div>
            <div>
              <h5 className="text-left" style={{ lineHeight: 1.1 }}>
                {/* Выведено */}
                Level
              </h5>
              <h4 className="text-left f-w-inherit" style={{ lineHeight: 1.1 }}>
                {`${+parseFloat(level)?.toFixed(2)}%`}
              </h4>
            </div>
            <div>
              <h5 className="text-left" style={{ lineHeight: 1.1 }}>
                {/* Выведено */}
                Withdrawn
              </h5>
              <h4 className="text-left f-w-inherit" style={{ lineHeight: 1.1 }}>
                {deposits
                  .filter(({ type }) => type === "Withdraw")
                  .reduce((p, { sum }) => p + +sum, 0)}
              </h4>
            </div>
          </div>
        </div>
        <div id="profile-referral-code">
          <h5>Referral code</h5>
          <input type="text" disabled="true" value={userOrders?.refCode} />
        </div>
      </div>
      <div id="board">
        {/* <ul className="nav nav-tabs">
          <li className="active">
            <a data-toggle="tab" href="#menu0" onclick="showTab('menu0')">
              Info
            </a>
          </li>
          <li>
            <a data-toggle="tab" href="#menu1" onclick="showTab('menu1')">
              Verification
            </a>
          </li>
          <li>
            <a data-toggle="tab" href="#menu2" onclick="showTab('menu2')">
              Overview
            </a>
          </li>
          <li>
            <a data-toggle="tab" href="#menu3" onclick="showTab('menu3')">
              Deals
            </a>
          </li>
          <li>
            <a data-toggle="tab" href="#menu4" onclick="showTab('menu4')">
              History
            </a>
          </li>
          <li>
            <a data-toggle="tab" href="#menu5" onclick="showTab('menu5')">
              News
            </a>
          </li>
          <li>
            <a data-toggle="tab" href="#menu6" onclick="showTab('menu6')">
              Referrals
            </a>
          </li>
        </ul> */}
        <Navbar className="nav nav-tabs p-0">
          <Nav className="me-auto" style={{ gap: "2px" }}>
            <Nav.Link
              className={tab === "info" && "active"}
              onClick={() => setTab("info")}
            >
              Info
            </Nav.Link>
            <Nav.Link
              className={tab === "verification" && "active"}
              onClick={() => setTab("verification")}
            >
              Verification
            </Nav.Link>
            <Nav.Link
              className={tab === "overview" && "active"}
              onClick={() => setTab("overview")}
            >
              Overview
            </Nav.Link>
            <Nav.Link
              className={tab === "deals" && "active"}
              onClick={() => setTab("deals")}
            >
              Deals
            </Nav.Link>
            <Nav.Link
              className={tab === "delayed" && "active"}
              onClick={() => setTab("delayed")}
            >
              Delayed
            </Nav.Link>
            <Nav.Link
              className={tab === "history" && "active"}
              onClick={() => setTab("history")}
            >
              History
            </Nav.Link>
            <Nav.Link
              className={tab === "referral" && "active"}
              onClick={() => setTab("referral")}
            >
              Referrals
            </Nav.Link>
          </Nav>
        </Navbar>
        <div className="tab-content">
          {tab === "info" && (
            <div id="menu0" className="h-100">
              <div className="h-50 b-bottom">
                <div className="d-flex justify-content-evenly py-4">
                  <div className="d-flex flex-column align-items-start gap-4">
                    <span className="b-bottom">Name</span>
                    <span className="b-bottom">Surname</span>
                    <span className="b-bottom">Email</span>
                    <span className="b-bottom">Phone</span>
                    <span className="b-bottom">Password</span>
                  </div>
                  <div className="d-flex flex-column gap-4">
                    <input
                      name="name"
                      type="text"
                      placeholder="Name"
                      disabled={!isInfoEdit}
                      value={newUserData.name}
                      onChange={handleUserInfoChange}
                    />
                    <input
                      name="surname"
                      type="text"
                      placeholder="Surname"
                      disabled={!isInfoEdit}
                      value={newUserData.surname}
                      onChange={handleUserInfoChange}
                    />
                    <input
                      name="email"
                      type="email"
                      placeholder="Email"
                      disabled={!isInfoEdit}
                      value={newUserData.email}
                      onChange={handleUserInfoChange}
                    />
                    <input
                      name="phone"
                      type="tel"
                      placeholder="Phone"
                      disabled={!isInfoEdit}
                      value={newUserData.phone}
                      onChange={handleUserInfoChange}
                    />
                    <div className="position-relative">
                      <input
                        name="password"
                        type={passwordShown ? "text" : "password"}
                        placeholder="Password"
                        disabled={!isInfoEdit}
                        value={newUserData.password}
                        onChange={handleUserInfoChange}
                      />
                      <FontAwesomeIcon
                        cursor="pointer"
                        className="position-absolute ms-1"
                        style={{ top: 4 }}
                        icon={passwordShown ? faEyeSlash : faEye}
                        onClick={() => setPasswordShown(!passwordShown)}
                      />
                    </div>
                  </div>
                  <div className="d-flex flex-column align-items-start gap-4">
                    <span className="b-bottom">Country</span>
                    <span className="b-bottom">City</span>
                    <span className="b-bottom">Date registered</span>
                    <span className="b-bottom">Comment</span>
                  </div>
                  <div className="d-flex flex-column gap-4">
                    <input
                      name="country"
                      type="text"
                      placeholder="Country"
                      disabled={!isInfoEdit}
                      value={newUserData.country}
                      onChange={handleUserInfoChange}
                    />
                    <input
                      name="city"
                      type="text"
                      placeholder="City"
                      disabled={!isInfoEdit}
                      value={newUserData.city}
                      onChange={handleUserInfoChange}
                    />
                    <input
                      type="text"
                      placeholder="Date Registered"
                      disabled
                      value={moment(
                        newUserData?.createdAt?.seconds * 1000
                      )?.format("DD/MM/YYYY")}
                    />
                    <input
                      name="comment"
                      type="text"
                      placeholder="Comment"
                      disabled={!isInfoEdit}
                      value={newUserData.comment}
                      onChange={handleUserInfoChange}
                    />
                  </div>
                </div>
                <section className="d-flex justify-content-around">
                  <button
                    id="editButton"
                    className="w-25 rounded"
                    onClick={(e) => {
                      if (isInfoEdit) {
                        setNewUserData(selectedUser);
                        setIsInfoEdit(false);
                      } else {
                        setIsInfoEdit(true);
                      }
                    }}
                  >
                    {isInfoEdit ? "Cancel" : "Edit"}
                  </button>
                  <button
                    id="saveButton"
                    disabled={!isInfoEdit}
                    className={`w-25 rounded ${!isInfoEdit && "stopClik"}`}
                    onClick={(e) => {
                      if (isInfoEdit) {
                        updateUser();
                        setIsInfoEdit(false);
                      }
                    }}
                  >
                    Save
                  </button>
                </section>
              </div>
              <div id="menu0-extra">
                <table className="table table-hover table-striped">
                  <thead>
                    <tr>
                      <th className="text-center" scope="col">
                        Дата
                      </th>
                      <th className="text-center" scope="col">
                        Админ
                      </th>
                      <th className="text-center" scope="col">
                        Данные
                      </th>
                      <th className="text-center" scope="col">
                        Изменение
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>03-08-2022 9:01</td>
                      <td>Супер Админ</td>
                      <td>Пароль</td>
                      <td>12345678</td>
                    </tr>
                    <tr>
                      <td>01-01-2024 12:11</td>
                      <td>Тест Админ</td>
                      <td>Комментарий</td>
                      <td>Тест</td>
                    </tr>
                    <tr>
                      <td>03-08-2022 16:45</td>
                      <td>Супер Админ</td>
                      <td>Ретен статус</td>
                      <td>Новый</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "verification" && (
            <div id="menu1">
              <div className="menu1-main">
                <div className="menu1-title">
                  <h4 className="f-s-inherit" style={{ lineHeight: 1.1 }}>
                    Documentation
                  </h4>
                  <button>Save</button>
                </div>
                <div
                  className="form-check form-switch"
                  // style={{
                  //   display: "flex",
                  //   flexDirection: "row",
                  // }}
                >
                  <label className="form-check-label f-s-inherit f-w-700 mt-1">
                    ID Confirmation
                  </label>
                  <input className="form-check-input mt-2" type="checkbox" />
                  {idFiles?.length < 4 && (
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={16}
                        fill="currentColor"
                        className="bi bi-cloud-upload"
                        viewBox="0 0 16 16"
                        style={{ marginRight: 5, cursor: "pointer" }}
                        onClick={() => handleUploadClick(idInputRef)}
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.406 1.342A5.53 5.53 0 0 1 8 0c2.69 0 4.923 2 5.166 4.579C14.758 4.804 16 6.137 16 7.773 16 9.569 14.502 11 12.687 11H10a.5.5 0 0 1 0-1h2.688C13.979 10 15 8.988 15 7.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 2.825 10.328 1 8 1a4.53 4.53 0 0 0-2.941 1.1c-.757.652-1.153 1.438-1.153 2.055v.448l-.445.049C2.064 4.805 1 5.952 1 7.318 1 8.785 2.23 10 3.781 10H6a.5.5 0 0 1 0 1H3.781C1.708 11 0 9.366 0 7.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383z"
                        />
                        <path
                          fillRule="evenodd"
                          d="M7.646 4.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V14.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3z"
                        />
                      </svg>
                      <input
                        type="file"
                        multiple
                        ref={idInputRef}
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(e, setIdFiles)}
                      />
                    </div>
                  )}
                  <div className="d-flex align-items-center justify-content-between">
                    {idFiles?.map((file, index) => (
                      <img
                        key={index}
                        src={URL.createObjectURL(file)}
                        alt={`Selected Image ${index + 1}`}
                        style={{
                          width: "100px",
                          height: "50px",
                          margin: "0px 5px",
                          objectFit: "cover",
                          cursor: "pointer",
                        }}
                        onClick={() => handleImageClick(file)}
                      />
                    ))}

                    <ImageModal
                      show={modalShow}
                      onHide={() => setModalShow(false)}
                      image={selectedImage}
                    />
                  </div>
                </div>
                <div className="form-check form-switch">
                  <label className="form-check-label f-s-inherit f-w-700 mt-1">
                    Location
                  </label>
                  <input className="form-check-input mt-2" type="checkbox" />
                  {locationFiles?.length < 4 && (
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={16}
                        fill="currentColor"
                        className="bi bi-cloud-upload"
                        viewBox="0 0 16 16"
                        style={{ marginRight: 5, cursor: "pointer" }}
                        onClick={() => handleUploadClick(locationInputRef)}
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.406 1.342A5.53 5.53 0 0 1 8 0c2.69 0 4.923 2 5.166 4.579C14.758 4.804 16 6.137 16 7.773 16 9.569 14.502 11 12.687 11H10a.5.5 0 0 1 0-1h2.688C13.979 10 15 8.988 15 7.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 2.825 10.328 1 8 1a4.53 4.53 0 0 0-2.941 1.1c-.757.652-1.153 1.438-1.153 2.055v.448l-.445.049C2.064 4.805 1 5.952 1 7.318 1 8.785 2.23 10 3.781 10H6a.5.5 0 0 1 0 1H3.781C1.708 11 0 9.366 0 7.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383z"
                        />
                        <path
                          fillRule="evenodd"
                          d="M7.646 4.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V14.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3z"
                        />
                      </svg>
                      <input
                        type="file"
                        multiple
                        ref={locationInputRef}
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(e, setLocationFiles)}
                      />
                    </div>
                  )}
                  <div className="d-flex align-items-center justify-content-between">
                    {locationFiles?.map((file, index) => (
                      <img
                        key={index}
                        src={URL.createObjectURL(file)}
                        alt={`Selected Image ${index + 1}`}
                        style={{
                          width: "100px",
                          height: "50px",
                          margin: "0px 5px",
                          objectFit: "cover",
                          cursor: "pointer",
                        }}
                        onClick={() => handleImageClick(file)}
                      />
                    ))}
                  </div>
                </div>
                <div className="form-check form-switch">
                  <label className="form-check-label f-s-inherit f-w-700 mt-1">
                    Map
                  </label>
                  <input className="form-check-input mt-2" type="checkbox" />
                  {mapFiles?.length < 4 && (
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={16}
                        fill="currentColor"
                        className="bi bi-cloud-upload"
                        viewBox="0 0 16 16"
                        style={{ marginRight: 5, cursor: "pointer" }}
                        onClick={() => handleUploadClick(mapInputRef)}
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.406 1.342A5.53 5.53 0 0 1 8 0c2.69 0 4.923 2 5.166 4.579C14.758 4.804 16 6.137 16 7.773 16 9.569 14.502 11 12.687 11H10a.5.5 0 0 1 0-1h2.688C13.979 10 15 8.988 15 7.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 2.825 10.328 1 8 1a4.53 4.53 0 0 0-2.941 1.1c-.757.652-1.153 1.438-1.153 2.055v.448l-.445.049C2.064 4.805 1 5.952 1 7.318 1 8.785 2.23 10 3.781 10H6a.5.5 0 0 1 0 1H3.781C1.708 11 0 9.366 0 7.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383z"
                        />
                        <path
                          fillRule="evenodd"
                          d="M7.646 4.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V14.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3z"
                        />
                      </svg>
                      <input
                        type="file"
                        multiple
                        ref={mapInputRef}
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(e, setMapFiles)}
                      />
                    </div>
                  )}
                  <div className="d-flex align-items-center justify-content-between">
                    {mapFiles?.map((file, index) => (
                      <img
                        key={index}
                        src={URL.createObjectURL(file)}
                        alt={`Selected Image ${index + 1}`}
                        style={{
                          width: "100px",
                          height: "50px",
                          margin: "0px 5px",
                          objectFit: "cover",
                          cursor: "pointer",
                        }}
                        onClick={() => handleImageClick(file)}
                      />
                    ))}
                  </div>
                </div>
                <div className="form-check form-switch">
                  <label className="form-check-label f-s-inherit f-w-700 mt-1">
                    Place of Work
                  </label>
                  <input className="form-check-input mt-2" type="checkbox" />
                  {placeFiles?.length < 4 && (
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={16}
                        fill="currentColor"
                        className="bi bi-cloud-upload"
                        viewBox="0 0 16 16"
                        style={{ marginRight: 5, cursor: "pointer" }}
                        onClick={() => handleUploadClick(placeInputRef)}
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.406 1.342A5.53 5.53 0 0 1 8 0c2.69 0 4.923 2 5.166 4.579C14.758 4.804 16 6.137 16 7.773 16 9.569 14.502 11 12.687 11H10a.5.5 0 0 1 0-1h2.688C13.979 10 15 8.988 15 7.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 2.825 10.328 1 8 1a4.53 4.53 0 0 0-2.941 1.1c-.757.652-1.153 1.438-1.153 2.055v.448l-.445.049C2.064 4.805 1 5.952 1 7.318 1 8.785 2.23 10 3.781 10H6a.5.5 0 0 1 0 1H3.781C1.708 11 0 9.366 0 7.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383z"
                        />
                        <path
                          fillRule="evenodd"
                          d="M7.646 4.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V14.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3z"
                        />
                      </svg>
                      <input
                        type="file"
                        multiple
                        ref={placeInputRef}
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(e, setPlaceFiles)}
                      />
                    </div>
                  )}
                  <div className="d-flex align-items-center justify-content-between px-3">
                    {placeFiles?.map((file, index) => (
                      <img
                        key={index}
                        src={URL.createObjectURL(file)}
                        alt={`Selected Image ${index + 1}`}
                        style={{
                          width: "100px",
                          height: "50px",
                          margin: "0px 5px",
                          objectFit: "cover",
                          cursor: "pointer",
                        }}
                        onClick={() => handleImageClick(file)}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="menu1-main">
                <div className="menu1-title">
                  <h4 className="f-s-inherit" style={{ lineHeight: 1.1 }}>
                    Rights
                  </h4>
                  <button onClick={updateUser}>Save</button>
                </div>
                <div className="form-check form-switch">
                  <label className="form-check-label f-s-inherit f-w-700">
                    Allow Trading
                  </label>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={newUserData.allowTrading}
                    onChange={(e) =>
                      setNewUserData((p) => ({
                        ...p,
                        allowTrading: e.target.checked,
                      }))
                    }
                  />
                </div>
                <div className="form-check form-switch">
                  <label className="form-check-label  f-s-inherit f-w-700">
                    Allow data change
                  </label>
                  <input className="form-check-input" type="checkbox" />
                </div>
                <div className="form-check form-switch">
                  <label className="form-check-label f-s-inherit f-w-700">
                    Allow withdrawl
                  </label>
                  <input className="form-check-input" type="checkbox" />
                </div>
              </div>
            </div>
          )}

          {tab === "overview" && (
            <div id="menu2">
              <div id="menu3-buttons">
                <button
                  id="menu3-edit"
                  className="btn btn-secondary"
                  onClick={() => {
                    if (isEdit) {
                      setClosedOrders(
                        userOrders.filter(({ status }) => status !== "Pending")
                      );
                      setIsEdit(false);
                    } else {
                      setIsEdit(true);
                    }
                  }}
                >
                  {isEdit ? "Cancel" : "Edit"}
                </button>
                <button
                  id="menu3-save"
                  className="btn btn-secondary"
                  onClick={saveClosedOrders}
                  disabled={!isEdit}
                >
                  Save
                </button>
              </div>
              <DataTable
                columns={overviewColumns({
                  isEdit,
                  handleEditOrder: handleEditOverviewOrders,
                  showColumns,
                })}
                data={fillArrayWithEmptyRows(closedOrders, 10)}
                highlightOnHover
                pointerOnHover
                pagination
                paginationPerPage={10}
                paginationTotalRows={closedOrders.length}
                paginationComponentOptions={{
                  noRowsPerPage: 1,
                }}
                // paginationRowsPerPageOptions={[5, 10, 20, 50]}
                customStyles={customStyles}
                // responsive
              />
            </div>
          )}
          {tab === "deals" && (
            <div id="menu3">
              <DataTable
                columns={dealsColumns({
                  handleEditOrder,
                  handleCloseOrder,
                  showColumns,
                })}
                data={fillArrayWithEmptyRows(activeOrders, 10)}
                highlightOnHover
                pointerOnHover
                pagination
                paginationPerPage={10}
                paginationTotalRows={activeOrders.length}
                paginationComponentOptions={{
                  noRowsPerPage: 1,
                }}
                // paginationRowsPerPageOptions={[5, 10, 20, 50]}
                onRowClicked={(row) => row && setSelectedOrder(row)}
                onRowDoubleClicked={(row) => row && setIsDealEdit(true)}
                conditionalRowStyles={[
                  {
                    when: (row) => row && row.id === selectedOrder?.id,
                    style: {
                      backgroundColor: "#D1FFBD",
                      userSelect: "none",
                    },
                  },
                ]}
                customStyles={customStyles}
              />
            </div>
          )}

          {tab === "delayed" && (
            <div id="menu3">
              <DataTable
                columns={delayedColumns({
                  handleEditOrder,
                  handleCancelOrder,
                  showColumns,
                })}
                data={fillArrayWithEmptyRows(delayedOrders, 10)}
                highlightOnHover
                pointerOnHover
                pagination
                paginationPerPage={10}
                paginationTotalRows={delayedOrders.length}
                paginationComponentOptions={{
                  noRowsPerPage: 1,
                }}
                // paginationRowsPerPageOptions={[5, 10, 20, 50]}
                onRowClicked={(row) => row && setSelectedOrder(row)}
                onRowDoubleClicked={(row) => row && setIsDealEdit(true)}
                conditionalRowStyles={[
                  {
                    when: (row) => row && row.id === selectedOrder?.id,
                    style: {
                      backgroundColor: "#D1FFBD",
                      userSelect: "none",
                    },
                  },
                ]}
                customStyles={customStyles}
              />
            </div>
          )}

          {tab === "history" && (
            <div id="menu">
              <DataTable
                columns={depositsColumns}
                data={fillArrayWithEmptyRows(deposits, 10)}
                highlightOnHover
                pointerOnHover
                pagination
                paginationPerPage={10}
                paginationTotalRows={deposits.length}
                paginationComponentOptions={{
                  noRowsPerPage: 1,
                }}
                // paginationRowsPerPageOptions={[5, 10, 20, 50]}
                // responsive
                customStyles={customStyles}
              />
            </div>
          )}

          {tab === "referral" && (
            <div id="menu6">
              <div className="ref-table w-100 pt-2 pb-4 mb-1">
                <p className="my-3">Referral Information</p>
                <form id="addNewUser">
                  <div id="" className="">
                    <input
                      type="text"
                      value={userOrders?.name}
                      placeholder="John Doe"
                      className="refInput"
                    />
                    <input
                      type="text"
                      value={userOrders?.refCode}
                      placeholder="Qc1iOSzP"
                      className="refInput"
                    />
                  </div>
                </form>
              </div>
              <div className="ref-table">
                <p className="text-center my-3">Referred</p>
                <DataTable
                  columns={referralUserColumns}
                  data={fillArrayWithEmptyRows(userOrders, 5)}
                  highlightOnHover
                  pointerOnHover
                  pagination
                  paginationPerPage={5}
                  paginationTotalRows={userOrders.length}
                  paginationComponentOptions={{
                    noRowsPerPage: 1,
                  }}
                  paginationRowsPerPageOptions={[5, 10, 20, 50]}
                  responsive
                  customStyles={customStyles}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      {isBalOpen && <AddBalanceModal setShowModal={setIsBalOpen} />}
      {isDelModalOpen && (
        <DelOrderModal selectedOrder={selectedOrder} onClose={handleClose} />
      )}
      {showCancelOrderModal && (
        <CancelOrderModal
          selectedOrder={selectedOrder}
          setShow={setShowCancelOrderModal}
          userProfile={newUserData}
        />
      )}
      {isDealEdit && (
        <EditOrder
          onClose={handleClose}
          show={isDealEdit}
          selectedOrder={selectedOrder}
        />
      )}

      {isUserEdit && <EditUserModal onClose={handleClose} show={isUserEdit} />}
      {showColumnsModal && (
        <SelectColumnsModal
          columnKey={
            tab === "overview"
              ? "overviewColumns"
              : tab === "deals"
              ? "dealsColumns"
              : tab === "delayed"
              ? "delayedColumns"
              : ""
          }
          setModal={setShowColumnsModal}
          columns={showColumns}
          setColumns={setShowColumns}
        />
      )}
    </div>
  );
}
