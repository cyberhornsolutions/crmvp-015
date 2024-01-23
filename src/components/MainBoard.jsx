import React, { useEffect, useRef, useState, useCallback } from "react";
import placeholder from "../acc-img-placeholder.png";
import { Nav, Navbar, ProgressBar } from "react-bootstrap";
import { db } from "../firebase";
import { addUserNewBalance, getAllSymbols } from "../utills/firebaseHelpers";
import {
  getDocs,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  orderBy,
} from "firebase/firestore";
import ImageModal from "./ImageModal";
import DataTable from "react-data-table-component";
import { ToastContainer, toast } from "react-toastify";
import DelOrderModal from "./DelOrderModal";
import EditOrder from "./EditOrder";
import { useDispatch, useSelector } from "react-redux";
import { setUserOrders } from "../redux/slicer/orderSlicer";
import { setSymbolsState } from "../redux/slicer/symbolsSlicer";
import EditUserModal from "./EditUserModal";
import AddBalanceModal from "./AddBalanceModal";
import dealsColumns from "./columns/dealsColumns";
import overviewColumns from "./columns/overviewColumns";
import {
  convertTimestamptToDate,
  fillArrayWithEmptyRows,
  getAskValue,
  getBidValue,
} from "../utills/helpers";
import moment from "moment";

export default function MainBoard() {
  const dispatch = useDispatch();
  const userOrders = useSelector((state) => state?.userOrders?.orders);
  const symbols = useSelector((state) => state?.symbols);
  const { selectedUser } = useSelector((state) => state?.user);
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const idInputRef = useRef(null);
  const locationInputRef = useRef(null);
  const mapInputRef = useRef(null);
  const placeInputRef = useRef(null);
  const [isBalOpen, setIsBalOpen] = useState(false);
  const [idFiles, setIdFiles] = useState([]);
  const [locationFiles, setLocationFiles] = useState([]);
  const [mapFiles, setMapFiles] = useState([]);
  const [placeFiles, setPlaceFiles] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [newUserData, setNewUserData] = useState(selectedUser);
  const [isDelModalOpen, setIsDelModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState();
  const [isDealEdit, setIsDealEdit] = useState(false);
  const [userOrderData, setUserOrderData] = useState(userOrders);
  const [isUserEdit, setIsUserEdit] = useState(false);

  const handleKeyPress = (event) => {
    const keyCode = event.keyCode || event.which;
    const keyValue = String.fromCharCode(keyCode);

    // Allow only numeric keys (0-9)
    if (!/^\d+$/.test(keyValue)) {
      event.preventDefault();
    }
  };
  // const fetchOrders = async (row, isOk = false) => {
  //   console.log("UserId", row?.id);
  //   const orders = [];

  //   try {
  //     const q = query(
  //       collection(db, "orders"),
  //       orderBy("createdTime", "desc"),
  //       where("userId", "==", row?.id)
  //     );

  //     const unsubscribe = await onSnapshot(q, async (querySnapshot) => {
  //       await querySnapshot.forEach(async (doc) => {
  //         await orders.push({ id: doc.id, ...doc.data() });
  //       });
  //       let profit = 0;
  //       orders?.map((el) => {
  //         if (
  //           el.status.toLocaleLowerCase() == "success" ||
  //           el.status.toLocaleLowerCase() == "closed"
  //         ) {
  //           profit = profit + parseFloat(el.profit);
  //         }

  //         setUserProfit(profit);
  //       });
  //       const newO = orders?.map((order, i) => ({
  //         index: i + 1,
  //         id: order?.id,
  //         type: order?.type,
  //         symbol: order?.symbol,
  //         sl: order?.sl,
  //         sum: order?.volume,
  //         price: order?.symbolValue,
  //         tp: order?.tp,
  //         status: order?.status,
  //         profit: order?.profit,
  //         userId: order?.userId,
  //         createdAt: order?.createdAt,
  //         docId: order?.id,
  //         createdTime: order?.createdTime,
  //       }));
  //       dispatch(setUserOrders(newO));
  //       setUserOrderData(
  //         orders?.map((order, i) => ({
  //           index: i + 1,
  //           id: order?.id,
  //           type: order?.type,
  //           symbol: order?.symbol,
  //           sl: order?.sl,
  //           sum: order?.volume,
  //           price: order?.symbolValue,
  //           tp: order?.tp,
  //           status: order?.status,
  //           profit: order?.profit,
  //           userId: order?.userId,
  //           createdAt: order?.createdAt,
  //           docId: order?.id,
  //           createdTime: order?.createdTime,
  //         }))
  //       );
  //     });

  //     console.log(orders, row, 222);

  //     // Return a cleanup function to unsubscribe when the component unmounts
  //     return () => {
  //       unsubscribe();
  //     };
  //   } catch (error) {
  //     console.error("Error fetching orders:", error);
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

  const addNewBalance = async (amount) => {
    await addUserNewBalance(selectedUser.id, amount);
    setNewBalance(0);
    setIsBalOpen(false);
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
  const getDeposits = async (userId) => {
    try {
      const depositsRef = collection(db, "deposits");
      const userDepositsQuery = query(
        depositsRef,
        orderBy("createdAt", "desc"),
        where("userId", "==", userId)
      );

      const unsubscribe = onSnapshot(
        userDepositsQuery,
        (snapshot) => {
          const depositsData = [];
          snapshot.forEach((doc) => {
            depositsData.push({ id: doc.id, ...doc.data() });
          });

          setDeposits(depositsData);
        },
        (error) => {
          console.error("Error fetching data:", error);
        }
      );

      // Optionally returning unsubscribe function for cleanup if needed
      return unsubscribe;
    } catch (error) {
      console.log("Error:", error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(
          query(
            collection(db, "users"),
            where("useRefCode", "==", newUserData.refCode)
          )
        );
        const userData = [];

        querySnapshot.forEach((doc) => {
          userData.push({ id: doc.id, ...doc.data() });
        });

        setUsers(userData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
    getDeposits(userOrders[0]?.userId);

    // setIsEdit(false);
  }, [userOrders.length]);

  const getSelectedUserData = () => {
    const userDocRef = doc(db, "users", selectedUser.id);
    const unsubscribe = onSnapshot(
      userDocRef,
      (userDocSnapshot) => {
        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          setNewUserData(userData);
        } else {
          console.error("User ID does not exist in the database.");
        }
      },
      (error) => {
        console.error("Error fetching user:", error);
      }
    );
    return () => unsubscribe();
  };

  useEffect(() => {
    return getSelectedUserData();
  }, []);

  useEffect(() => {
    setUserOrderData(userOrders);
  }, [userOrders]);

  const setSymbols = useCallback((symbolsData) => {
    dispatch(setSymbolsState(symbolsData));
  }, []);

  useEffect(() => {
    if (!symbols.length) {
      return getAllSymbols(setSymbols, setLoading);
    }
  }, []);

  const saveOrders = async () => {
    for (let i = 0; i < userOrderData.length; i++) {
      if (userOrderData[i].sum <= 0) {
        toast.error("Sum value should be greater than 0");
        return;
      }
      if (userOrderData[i].symbolValue <= 0) {
        toast.error("Open Price value should be greater than 0");
        return;
      }
    }
    let status = "success";
    userOrderData.forEach(async (order) => {
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

  const handleSaveVerification = async () => {
    try {
      const userDocRef = doc(db, "users", selectedUser.id);
      await updateDoc(userDocRef, { allowTrading: newUserData.allowTrading });
      toast.success("User info updated");

      console.log("User updated successfully");
    } catch (error) {
      console.log("error in updating user =", error);
    }
  };

  const updateOrderState = (id) => {
    const orders = userOrders?.map((el) => {
      if (el?.id == id) {
        return { ...el, status: "Closed" };
      } else {
        return el;
      }
    });
    setUserOrderData(orders);
  };
  const handleEdit = (id, field, value) => {
    const updatedData = userOrders?.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setUserOrderData(updatedData);
  };
  const handleEditOverviewOrders = (id, field, value) => {
    const updatedData = userOrderData
      .filter(({ status }) => status !== "Pending")
      .map((item) => (item.id === id ? { ...item, [field]: value } : item));
    setUserOrderData(updatedData);
  };
  const handleEditOrder = (row) => {
    setSelectedOrder(row);
    setIsDealEdit(true);
  };
  const handleCloseOrder = (row) => {
    setSelectedOrder(row);
    setIsDelModalOpen(true);
  };

  const depositColumns = [
    {
      name: "Date",
      selector: (row) => row && convertTimestamptToDate(row.createdAt),
    },
    { name: "Sum", selector: (row) => row.sum },
    { name: "Type", selector: (row) => row.type },
  ];
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

  const openOrders = userOrderData
    ?.filter(({ status }) => status === "Pending")
    .map((order) => {
      const symbol = symbols.find((s) => s.symbol === order.symbol);
      if (!symbol) return order;
      let enableOpenPrice = false;
      if (order.enableOpenPrice && order.openPriceValue !== symbol.price) {
        enableOpenPrice = true;
      }
      const { bidSpread, askSpread, fee, swapShort, swapLong } =
        symbol.settings;
      const swap = order.type === "Buy" ? swapShort : swapLong;
      let swapValue = 0;
      if (order.createdTime) {
        const jsDate = new Date(order.createdTime.seconds * 1000).setHours(
          0,
          0,
          0
        );
        swapValue = (order.sum / 100) * (swap * moment().diff(jsDate, "d"));
      }
      return {
        ...order,
        currentPrice: symbol.price,
        enableOpenPrice,
        bidSpread,
        askSpread,
        fee,
        swap: swapValue,
      };
    });

  const closedOrders = userOrderData?.filter(
    ({ status }) => status !== "Pending"
  );

  const calculateProfit = () => {
    let totalProfit = 0.0;
    userOrders?.map((el) => {
      if (el.status != "Pending") {
        totalProfit = totalProfit + parseFloat(el.profit);
      }
    });
    return totalProfit;
  };
  const userProfit = calculateProfit();

  const allowBonus = newUserData?.settings?.allowBonus;
  const allBonus = deposits.reduce((p, v) => p + parseFloat(v.sum), 0);

  const calculateTotalBalance = () => {
    let balance = parseFloat(newUserData.totalBalance);
    if (userProfit) balance += parseFloat(userProfit);
    if (allowBonus) balance += allBonus;
    return balance;
  };

  const totalBalance = calculateTotalBalance();

  const calculateFreeMargin = () => {
    let freeMarginOpened = totalBalance;
    openOrders.forEach((el) => {
      const orderPrice =
        el.type === "Buy"
          ? getBidValue(el.currentPrice, el.bidSpread)
          : getAskValue(el.currentPrice, el.askSpread);
      const dealSum = parseFloat(el.volume) * orderPrice;
      freeMarginOpened -= parseFloat(dealSum);
    });
    return freeMarginOpened < 0 ? 0.0 : freeMarginOpened;
  };
  const freeMarginData = calculateFreeMargin();

  const calculatePledge = () => {
    let totalPledge = 0.0;
    openOrders.forEach((el) => {
      const spread = el.sum / 100; // 1% of sum
      const swap = el.swap;
      const pledge = el.sum - spread - swap;
      totalPledge += pledge;
    });
    return +totalPledge;
  };

  const pledge = calculatePledge();

  const calculateEquity = () => {
    let equity = freeMarginData + pledge;
    if (allowBonus) equity -= allBonus;
    return equity;
  };

  const equity = calculateEquity();

  return (
    <div id="mainboard">
      <ToastContainer />
      <div id="profile">
        <img id="profile-pic" src={placeholder} alt="" />
        <div id="profile-i">
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
        </div>
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
                {openOrders.length}
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
                {totalBalance.toFixed(6)}
              </h4>
            </div>
            <div>
              <h5 className="text-left" style={{ lineHeight: 1.1 }}>
                {/* Профит */}Profit
              </h5>
              <h4 className="text-left f-w-inherit" style={{ lineHeight: 1.1 }}>
                {userProfit.toFixed(6)}
              </h4>
            </div>
            <div>
              <h5 className="text-left" style={{ lineHeight: 1.1 }}>
                {/* Бонус */}
                Bonus
              </h5>
              <h4 className="text-left f-w-inherit" style={{ lineHeight: 1.1 }}>
                {allBonus.toFixed(6)}
              </h4>
            </div>
            <div>
              <h5 className="text-left" style={{ lineHeight: 1.1 }}>
                {/* Заведено */}
                Started
              </h5>
              <h4 className="text-left f-w-inherit" style={{ lineHeight: 1.1 }}>
                100.00
              </h4>
            </div>
          </div>
          <div>
            <div>
              <h5 className="text-left" style={{ lineHeight: 1.1 }}>
                {/* Залог */}
                Pledge
              </h5>
              <h4 className="text-left f-w-inherit" style={{ lineHeight: 1.1 }}>
                {pledge.toFixed(6)}
              </h4>
            </div>
            <div>
              <h5 className="text-left" style={{ lineHeight: 1.1 }}>
                {/* Эквити */}
                Equity
              </h5>
              <h4 className="text-left f-w-inherit" style={{ lineHeight: 1.1 }}>
                {equity.toFixed(6)}
              </h4>
            </div>
            <div>
              <h5 className="text-left" style={{ lineHeight: 1.1 }}>
                {/* Уровень маржи */}
                Free margin
              </h5>
              <h4 className="text-left f-w-inherit" style={{ lineHeight: 1.1 }}>
                {freeMarginData.toFixed(6)}
              </h4>
            </div>
            <div>
              <h5 className="text-left" style={{ lineHeight: 1.1 }}>
                {/* Выведено */}
                Withdrawn
              </h5>
              <h4 className="text-left f-w-inherit" style={{ lineHeight: 1.1 }}>
                00.00
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
              className={tab === 0 && "active"}
              onClick={() => setTab(0)}
            >
              Info
            </Nav.Link>
            <Nav.Link
              className={tab === 1 && "active"}
              onClick={() => setTab(1)}
            >
              Verification
            </Nav.Link>
            <Nav.Link
              className={tab === 2 && "active"}
              onClick={() => setTab(2)}
            >
              Overview
            </Nav.Link>
            <Nav.Link
              className={tab === 3 && "active"}
              onClick={() => setTab(3)}
            >
              Deals
            </Nav.Link>
            <Nav.Link
              className={tab === 4 && "active"}
              onClick={() => setTab(4)}
            >
              History
            </Nav.Link>
            <Nav.Link
              className={tab === 5 && "active"}
              onClick={() => setTab(5)}
            >
              News
            </Nav.Link>
            <Nav.Link
              className={tab === 6 && "active"}
              onClick={() => setTab(6)}
            >
              Referrals
            </Nav.Link>
          </Nav>
        </Navbar>
        <div className="tab-content">
          {tab === 0 && (
            <div id="menu0">
              <div id="menu0-main">
                <div
                  id="profile-info-titles1"
                  className="justify-content-start"
                  style={{ gap: 14 }}
                >
                  <h5
                    className="f-s-inherit f-w-inherit"
                    style={{ lineHeight: 1.1 }}
                  >
                    Имя
                  </h5>
                  <h5
                    className="f-s-inherit f-w-inherit"
                    style={{ lineHeight: 1.1 }}
                  >
                    Имейл
                  </h5>
                  <h5
                    className="f-s-inherit f-w-inherit"
                    style={{ lineHeight: 1.1 }}
                  >
                    Пароль
                  </h5>
                  <h5
                    className="f-s-inherit f-w-inherit"
                    style={{ lineHeight: 1.1 }}
                  >
                    Телефон
                  </h5>
                  <h5
                    className="f-s-inherit f-w-inherit"
                    style={{ lineHeight: 1.1 }}
                  >
                    Страна
                  </h5>
                  <button
                    id="editButton"
                    onClick={() => {
                      const inputFields = document.querySelectorAll(
                        'input[type="text"], input[type="email"], input[type="password"], input[type="tel"], input[type="date"]'
                      );
                      inputFields.forEach(function (input) {
                        input.removeAttribute("disabled");
                      });
                    }}
                  >
                    Изменить
                  </button>
                </div>
                <div
                  id="profile-info-inputs1"
                  className="justify-content-start"
                  style={{ gap: 10 }}
                >
                  <input
                    id="profile-name"
                    type="text"
                    placeholder="Тест"
                    disabled="true"
                  />
                  <input type="email" placeholder="Тест" disabled="true" />
                  <input type="password" placeholder="Тест" disabled="true" />
                  <input type="tel" placeholder={+9010101010} disabled="true" />
                  <input type="text" placeholder="Тест" disabled="true" />
                  <button
                    id="saveButton"
                    onClick={() => {
                      const inputFields = document.querySelectorAll(
                        'input[type="text"], input[type="email"], input[type="password"], input[type="tel"], input[type="date"]'
                      );

                      inputFields.forEach(function (input) {
                        input.setAttribute("disabled", true);
                      });
                    }}
                  >
                    Сохранить
                  </button>
                </div>
                <div
                  id="profile-info-titles2"
                  className="justify-content-start"
                  style={{ gap: 14 }}
                >
                  <h5
                    className="f-s-inherit f-w-inherit"
                    style={{ lineHeight: 1.1 }}
                  >
                    Сейл статус
                  </h5>
                  <h5
                    className="f-s-inherit f-w-inherit"
                    style={{ lineHeight: 1.1 }}
                  >
                    Ретен статус
                  </h5>
                  <h5
                    className="f-s-inherit f-w-inherit"
                    style={{ lineHeight: 1.1 }}
                  >
                    Менеджер
                  </h5>
                  <h5
                    className="f-s-inherit f-w-inherit"
                    style={{ lineHeight: 1.1 }}
                  >
                    Аффилиат
                  </h5>
                  <h5
                    className="f-s-inherit f-w-inherit"
                    style={{ lineHeight: 1.1 }}
                  >
                    Зарегистрирован
                  </h5>
                  <h5
                    className="f-s-inherit f-w-inherit"
                    style={{ lineHeight: 1.1 }}
                  >
                    Комментарий
                  </h5>
                </div>
                <div
                  id="profile-info-inputs2"
                  className="justify-content-start"
                  style={{ gap: 10 }}
                >
                  <input type="text" placeholder="Тест" disabled="true" />
                  <input type="text" placeholder="Тест" disabled="true" />
                  <input type="text" placeholder="Тест" disabled="true" />
                  <input type="text" placeholder="Тест" disabled="true" />
                  <input type="date" placeholder="01/01/2022" disabled="true" />
                  <input type="text" placeholder="Тест" disabled="true" />
                </div>
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

          {tab === 1 && (
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
                  <button onClick={handleSaveVerification}>Save</button>
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

          {tab === 2 && (
            <div id="menu2">
              <div id="menu3-buttons">
                <button
                  id="menu3-edit"
                  className="btn btn-secondary"
                  onClick={() => {
                    if (isEdit) {
                      setUserOrderData(userOrders);
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
                  onClick={saveOrders}
                  disabled={!isEdit}
                >
                  Save
                </button>
              </div>
              <DataTable
                columns={overviewColumns({
                  isEdit,
                  handleEditOrder: handleEditOverviewOrders,
                })}
                data={fillArrayWithEmptyRows(closedOrders, 5)}
                highlightOnHover
                pointerOnHover
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[10, 20, 50]}
                // responsive
              />
            </div>
          )}
          {tab === 3 && (
            <div id="menu3">
              <DataTable
                columns={dealsColumns({
                  handleEditOrder,
                  handleCloseOrder,
                })}
                data={fillArrayWithEmptyRows(openOrders, 5)}
                highlightOnHover
                pointerOnHover
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[10, 20, 50]}
                // responsive
              />
            </div>
          )}

          {tab === 4 && (
            <div id="menu">
              <DataTable
                columns={depositColumns}
                data={fillArrayWithEmptyRows(deposits, 5)}
                highlightOnHover
                pointerOnHover
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[10, 20, 50]}
                // responsive
              />
            </div>
          )}

          {tab === 5 && <div id="menu5" />}

          {tab === 6 && (
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
                  paginationRowsPerPageOptions={[5, 10, 20, 50]}
                  responsive
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
      {isDealEdit && (
        <EditOrder
          onClose={handleClose}
          show={isDealEdit}
          selectedOrder={selectedOrder}
        />
      )}

      {isUserEdit && <EditUserModal onClose={handleClose} show={isUserEdit} />}
    </div>
  );
}
