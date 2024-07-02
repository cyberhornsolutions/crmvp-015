import React, { useEffect, useRef, useState, useCallback } from "react";
import placeholder from "../acc-img-placeholder.png";
import { Nav, Navbar, ProgressBar } from "react-bootstrap";
import { db } from "../firebase";
import {
  addDocument,
  getRecentChangesById,
  updateUserById,
} from "../utills/firebaseHelpers";
import {
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import ImageModal from "./ImageModal";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import DelOrderModal from "./DelOrderModal";
import SaveOrderModal from "./SaveOrderModal";
import CancelOrderModal from "./CancelOrderModal";
import EditOrder from "./EditOrder";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from "../redux/slicer/userSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import AddBalanceModal from "./AddBalanceModal";
import dealsColumns from "./columns/dealsColumns";
import delayedColumns from "./columns/delayedColumns";
import overviewColumns from "./columns/overviewColumns";
import depositsColumns from "./columns/depositsColumns";
import recentChangesColumns from "./columns/recentChangesColumns";
import { fillArrayWithEmptyRows } from "../utills/helpers";
import moment from "moment";
import SelectColumnsModal from "./SelectColumnsModal";
import SaveUserInfoModal from "./SaveUserInfoModal";

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
  const user = useSelector((state) => state?.user?.user);
  const orders = useSelector((state) => state.orders);
  const managers = useSelector((state) => state.managers);
  const [userOrders, setUserOrders] = useState([]);
  const columns = useSelector((state) => state?.columns);
  const selectedUser =
    useSelector((state) => state?.user.selectedUser) ||
    JSON.parse(localStorage.getItem("SELECTED_USER"));
  const deposits = useSelector((state) => state.deposits).filter(
    ({ userId }) => userId === selectedUser.userId
  );
  const [tab, setTab] = useState(
    () => localStorage.getItem("PLAYER_TAB") || "info"
  );
  const idInputRef = useRef(null);
  const editInputInfoRef = useRef(null);
  const selectedRowRef = useRef(null);
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
  const [showSaveInfoModal, setShowSaveInfoModal] = useState(false);
  const [newUserData, setNewUserData] = useState(selectedUser);
  const [isDelModalOpen, setIsDelModalOpen] = useState(false);
  const [isSaveOrderModalOpen, setIsSaveOrderModalOpen] = useState(false);
  const [showCancelOrderModal, setShowCancelOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState();
  const [selectedRow, setSelectedRow] = useState();
  const [isDealEdit, setIsDealEdit] = useState(false);
  const [closedOrders, setClosedOrders] = useState([]);
  const [showColumnsModal, setShowColumnsModal] = useState(false);
  const [showColumns, setShowColumns] = useState({});
  const [recentChanges, setRecentChanges] = useState([]);

  const accounts = newUserData?.accounts || [];
  const account = accounts.find(
    (ac) => ac.account_no === selectedUser?.account?.account_no
  );

  const accountDeposits = deposits.filter(
    ({ account_no }) => account_no === account?.account_no
  );

  useEffect(() => {
    if (!account) return;
    const _orders = orders.filter(
      (o) =>
        o.userId === selectedUser?.userId &&
        o.account_no === account?.account_no
    );
    const closed = _orders.filter(({ status }) => status !== "Pending");
    setUserOrders(_orders);
    // if (closed.length !== closedOrders.length)
    setClosedOrders(closed);
  }, [orders, account]);

  useEffect(() => {
    const unsubUserData = getSelectedUserData();
    const unsubChanges = getRecentChangesById(
      selectedUser.userId,
      setRecentChanges
    );
    return () => {
      unsubUserData();
      unsubChanges();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("PLAYER_TAB", tab);
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
      if (selectedRow) {
        setClosedOrders(
          userOrders.filter(({ status }) => status !== "Pending")
        );
        setSelectedRow();
      }
      header.removeEventListener("contextmenu", handleRightClick);
    };
  }, [tab]);

  const handleCloseSaveModal = (reset) => {
    if (reset)
      setClosedOrders(userOrders.filter(({ status }) => status !== "Pending"));
    setIsSaveOrderModalOpen(false);
    setSelectedRow();
  };

  useEffect(() => {
    if (!selectedRowRef.current || tab !== "overview" || !selectedRow) return;
    const handleOutsideClick = (e) => {
      if (selectedRowRef.current.contains(e.target)) return;
      selectedRowRef.current = null;
      setIsSaveOrderModalOpen(true);
    };
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
      selectedRowRef.current = null;
    };
  }, [selectedRowRef.current, tab]);

  useEffect(() => {
    if (tab === "info") {
      [
        "city",
        "comment",
        "country",
        "email",
        "name",
        "password",
        "phone",
        "surname",
      ].forEach((name) => {
        const inputField = document.querySelector(`input[name="${name}"]`);
        inputField.addEventListener("dblclick", () => {
          setIsEdit(true);
          editInputInfoRef.current = inputField;
          inputField.readOnly = false;
        });
      });
    }
  }, [tab]);

  useEffect(() => {
    if (tab !== "info") return;
    const handleOutsideClick = (e) => {
      if (editInputInfoRef.current.contains(e.target)) return;
      setShowSaveInfoModal(true);
    };
    if (isEdit) {
      document.addEventListener("click", handleOutsideClick);
    }
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isEdit]);

  const closeSaveInfoModal = () => {
    [
      "city",
      "comment",
      "country",
      "email",
      "name",
      "password",
      "phone",
      "surname",
    ].forEach((name) => {
      const inputField = document.querySelector(`input[name="${name}"]`);
      inputField.readOnly = true;
    });
    getSelectedUserData();
    setIsEdit(false);
    setShowSaveInfoModal(false);
  };

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
        userSelect: "none",
        // minHeight: 36,
        // height: 36,
      },
    },
  };

  const customInfoStyles = {
    rows: {
      style: {
        minHeight: 30,
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

  const handleAccountChange = async (e) => {
    const updatedAccounts = newUserData?.accounts?.map((ac) => ({
      ...ac,
      isDefault: +e.target.value === ac.account_no,
    }));
    try {
      const ans = await updateUserById(newUserData.userId, {
        accounts: updatedAccounts,
      });
      dispatch(
        setSelectedUser({
          ...selectedUser,
          account: updatedAccounts.find((ac) => ac.isDefault),
        })
      );
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
  };

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
    if (!selectedUser?.userId) return;
    const userDocRef = doc(db, "users", selectedUser.userId);
    const unsubscribe = onSnapshot(
      userDocRef,
      (userDocSnapshot) => {
        if (userDocSnapshot.exists()) {
          const data = userDocSnapshot.data();
          const ac = data?.accounts?.find(
            (ac) => ac.account_no === account.account_no
          );
          const userData = {
            ...data,
            id: ac?.account_no || userDocSnapshot.id,
            createdAt: { ...data.createdAt },
            account: ac,
            userId: userDocSnapshot.id,
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
    const dealPayload = { ...selectedRow };
    let { sum, symbolValue, profit, status } = dealPayload;
    sum = +parseFloat(sum);
    symbolValue = +parseFloat(symbolValue);
    profit = +parseFloat(profit);
    if (sum <= 0) return toast.error("Sum value should be greater than 0");
    if (!symbolValue || symbolValue <= 0)
      return toast.error("Open Price value should be greater than 0");
    if (!profit && profit != 0) return toast.error("Profit is missing");
    const eq = +equity + profit;
    if (eq < 0) return toast.error("This profit makes equity less than 0");
    if (eq < parseFloat(newUserData?.settings?.stopOut))
      return toast.error("This profit makes equity less than stop out value");
    try {
      if (status === "Pending") {
        delete dealPayload.closedPrice;
        delete dealPayload.closedDate;

        const userPayload = {
          totalBalance: parseFloat(
            newUserData?.totalBalance - dealPayload.fee - dealPayload.spread
          ),
          totalMargin: +(+totalMargin + +dealPayload.sum)?.toFixed(2),
          activeOrdersProfit: +(
            +activeOrdersProfit + +dealPayload.profit
          )?.toFixed(2),
          activeOrdersSwap: +(activeOrdersSwap - dealPayload.swap)?.toFixed(2),
        };
        await updateUserById(newUserData?.userId, userPayload);
      }

      const docRef = doc(db, "orders", dealPayload.id);
      await updateDoc(docRef, dealPayload);
      console.log(`Document with ID ${dealPayload.id} updated successfully`);
      handleCloseSaveModal();
    } catch (error) {
      console.error(
        `Error updating document with ID ${dealPayload.id}:`,
        error
      );
    }
    toast.success("Order updated successfully");
  };

  const updateUser = async () => {
    try {
      const keys = [
        "name",
        "surname",
        "email",
        "phone",
        "password",
        "country",
        "city",
        "comment",
      ];
      let changedKey;
      const unChanged = keys.every((key) => {
        const isChanged = selectedUser[key] === newUserData[key];
        if (!isChanged) changedKey = key;
        return isChanged;
      });
      if (unChanged) {
        closeSaveInfoModal();
        return;
      }
      const userPayload = {
        [changedKey]: newUserData[changedKey],
      };
      Object.keys(userPayload).forEach((key) => {
        if (!userPayload[key]) userPayload[key] = "";
      });
      const userDocRef = doc(db, "users", newUserData.userId);
      await updateDoc(userDocRef, userPayload);
      await addDocument("recentChanges", {
        userId: newUserData.userId,
        date: serverTimestamp(),
        manager: user.id,
        info: changedKey,
        update: newUserData[changedKey],
      });
      closeSaveInfoModal();
      toast.success("Saved successfully");
    } catch (error) {
      console.log("error in updating user =", error);
    }
  };

  const updateVerificationSettings = async (e) => {
    const unChanged = ["allowTrading"].every(
      (key) => selectedUser[key] === newUserData[key]
    );
    if (unChanged) return;

    try {
      const ans = await updateUserById(newUserData.userId, {
        allowTrading: newUserData.allowTrading,
      });
      toast.success("Saved successfully");
    } catch (error) {
      console.error("Error updating user profile:", error);
      toast.error("Failed to update user");
    }
  };

  const handleUserInfoChange = (e) =>
    setNewUserData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleEditOverviewOrders = (id, field, value) => {
    setSelectedRow((p) => ({ ...p, [field]: value }));
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

  let pendingOrders = [],
    activeOrders = [],
    delayedOrders = [],
    bonus = 0,
    activeOrdersProfit = 0,
    activeOrdersSwap = 0;

  if (account) {
    userOrders?.forEach((order) => {
      if (
        order.status === "Pending" &&
        order.account_no === account?.account_no
      ) {
        pendingOrders.push(order);
        if (!order.enableOpenPrice) activeOrders.push(order);
        else delayedOrders.push(order);
      }
    });

    bonus = parseFloat(account?.bonus) || 0;
    activeOrdersProfit = parseFloat(account?.activeOrdersProfit) || 0;
    activeOrdersSwap = parseFloat(account?.activeOrdersSwap) || 0;
  }

  const calculateEquity = () => {
    let equity =
      parseFloat(account?.totalBalance) + activeOrdersProfit - activeOrdersSwap;
    if (newUserData?.settings?.allowBonus) equity += bonus;
    return equity;
  };
  const equity = calculateEquity();
  const totalMargin = parseFloat(account?.totalMargin);

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
        {accounts.length ? (
          <>
            <select value={account?.account_no} onChange={handleAccountChange}>
              {accounts.map((ac, i) => (
                <option key={i} value={ac.account_no}>
                  {ac.account_no}
                </option>
              ))}
            </select>

            <div className="d-flex align-items-center justify-content-center mt-2 gap-3">
              <h6>Type: </h6>
              <h6>{account?.account_type} </h6>
            </div>
          </>
        ) : (
          ""
        )}
        <div id="profile-deals">
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
                {accountDeposits
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
                {accountDeposits
                  .filter(({ type }) => type === "Withdraw")
                  .reduce((p, { sum }) => p + +sum, 0)}
              </h4>
            </div>
          </div>
        </div>
        <div id="profile-referral-code">
          <h5>Referral code</h5>
          <input type="text" disabled="true" value={newUserData?.refCode} />
        </div>
      </div>
      <div id="board">
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
              <div className="b-bottom">
                <div className="d-flex justify-content-evenly py-4">
                  <div className="d-flex flex-column align-items-start gap-4">
                    <span className="b-bottom">Name</span>
                    <span className="b-bottom">Surname</span>
                    <span className="b-bottom">Email</span>
                    <span className="b-bottom">Phone</span>
                    <span className="b-bottom">Password</span>
                    <span className="b-bottom">Country</span>
                    <span className="b-bottom">City</span>
                    <span className="b-bottom">Date registered</span>
                  </div>
                  <div className="d-flex flex-column gap-4 info-section">
                    <input
                      name="name"
                      type="text"
                      placeholder="Name"
                      readOnly
                      value={newUserData.name}
                      onChange={handleUserInfoChange}
                    />
                    <input
                      name="surname"
                      type="text"
                      placeholder="Surname"
                      readOnly
                      value={newUserData.surname}
                      onChange={handleUserInfoChange}
                    />
                    <input
                      name="email"
                      type="email"
                      placeholder="Email"
                      readOnly
                      value={newUserData.email}
                      onChange={handleUserInfoChange}
                    />
                    <input
                      name="phone"
                      type="tel"
                      placeholder="Phone"
                      readOnly
                      value={newUserData.phone}
                      onChange={handleUserInfoChange}
                    />
                    <div className="position-relative">
                      <input
                        name="password"
                        type={passwordShown ? "text" : "password"}
                        placeholder="Password"
                        readOnly
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
                    <input
                      name="country"
                      type="text"
                      placeholder="Country"
                      readOnly
                      value={newUserData.country}
                      onChange={handleUserInfoChange}
                    />
                    <input
                      name="city"
                      type="text"
                      placeholder="City"
                      readOnly
                      value={newUserData.city}
                      onChange={handleUserInfoChange}
                    />
                    <input
                      type="text"
                      placeholder="Date Registered"
                      readOnly
                      value={moment(
                        newUserData?.createdAt?.seconds * 1000
                      )?.format("DD/MM/YYYY")}
                    />
                  </div>
                  <div className="d-flex flex-column align-items-start gap-4">
                    <span className="b-bottom">Comment</span>
                  </div>
                  <div className="d-flex flex-column gap-4">
                    <input
                      name="comment"
                      type="text"
                      placeholder="Comment"
                      readOnly
                      value={newUserData.comment}
                      onChange={handleUserInfoChange}
                    />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="f-s-inherit my-2">Recent Changes</h4>
                <DataTable
                  columns={recentChangesColumns}
                  data={fillArrayWithEmptyRows(
                    recentChanges.map((c) => ({
                      ...c,
                      manager: managers.find((m) => m.id === c.manager)
                        ?.username,
                    })),
                    5
                  )}
                  highlightOnHover
                  pointerOnHover
                  pagination
                  paginationPerPage={5}
                  paginationTotalRows={recentChanges.length}
                  paginationComponentOptions={{
                    noRowsPerPage: 1,
                  }}
                  // dense
                  // paginationRowsPerPageOptions={[5, 10, 20, 50]}
                  // responsive
                  customStyles={customInfoStyles}
                />
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
                  <button onClick={updateVerificationSettings}>Save</button>
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
              <DataTable
                columns={overviewColumns({
                  selectedRow,
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
                onRowDoubleClicked={(row, event) => {
                  if (!row || row.isEdit) return;
                  selectedRowRef.current = event.target.parentElement;
                  setClosedOrders((p) =>
                    p.map((item) => {
                      if (item.id === row.id) return { ...item, isEdit: true };
                      delete item.isEdit;
                      return item;
                    })
                  );
                  setSelectedRow(row);
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
                data={fillArrayWithEmptyRows(accountDeposits, 10)}
                highlightOnHover
                pointerOnHover
                pagination
                paginationPerPage={10}
                paginationTotalRows={accountDeposits.length}
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
                      value={newUserData?.name}
                      placeholder="John Doe"
                      className="refInput"
                    />
                    <input
                      type="text"
                      value={newUserData?.refCode}
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
      {isSaveOrderModalOpen && (
        <SaveOrderModal
          selectedOrder={selectedRow}
          handleSaveOrder={saveClosedOrders}
          closeModal={handleCloseSaveModal}
        />
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
      {showSaveInfoModal && (
        <SaveUserInfoModal
          closeModal={closeSaveInfoModal}
          handleSaveInfo={updateUser}
        />
      )}
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
