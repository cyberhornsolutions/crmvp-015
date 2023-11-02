import React, { useEffect, useRef, useState } from "react";
import placeholder from "../acc-img-placeholder.png";
import { Dropdown, Nav, NavItem, Navbar, ProgressBar } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import ImageModal from "./ImageModal";
import DataTable from "react-data-table-component";
import Sidebar from "./Sidebar";

export default function MainBoard() {
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const { state } = useLocation();
  const idInputRef = useRef(null);
  const locationInputRef = useRef(null);
  const mapInputRef = useRef(null);
  const placeInputRef = useRef(null);

  const [idFiles, setIdFiles] = useState([]);
  const [locationFiles, setLocationFiles] = useState([]);
  const [mapFiles, setMapFiles] = useState([]);
  const [placeFiles, setPlaceFiles] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  console.log("Selected image", selectedImage);
  console.log("show modal", modalShow);

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

  console.log("state", state);

  const progressBarConfig = {
    New: { variant: "success", now: 25 },
    InProgress: { variant: "info", now: 50 },
    Confirmed: { variant: "warning", now: 75 },
    Closed: { variant: "danger", now: 100 },
  };
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
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
    setIsEdit(false);
  }, []);
  useEffect(() => {
    if (isEdit) {
      edit();
    }
  }, [isEdit]);
  const save = () => {
    const tableCells = document.querySelectorAll("#menu3-table tbody td");
    tableCells.forEach((cell) => {
      const input = cell.querySelector("input");
      if (input) {
        cell.textContent = input.value;
      }
    });
    setIsEdit(false);
  };

  const edit = () => {
    setIsEdit(true);
    const tableRows = document.querySelectorAll("#menu3-table tbody tr");
    tableRows.forEach((row) => {
      const cellsToSkip = [0, 7];
      const cells = row.querySelectorAll("td");
      cells.forEach((cell, index) => {
        if (cellsToSkip.includes(index)) {
          return;
        }
        const text = cell.textContent;
        const inputElement = document.createElement("input");
        inputElement.type = "text";
        inputElement.value = text;
        inputElement.style.width = "80px";
        cell.innerHTML = "";
        cell.appendChild(inputElement);
      });
    });
  };

  const dealsColumns = [
    {
      name: "ID",
      selector: (row) => row.id,
      sortable: true,
    },
    {
      name: "Transaction Type",
      selector: (row) => row.type,
      sortable: true,
    },
    {
      name: "Symbol",
      selector: (row) => row.symbol,
      sortable: true,
    },
    {
      name: "Sum",
      selector: (row) => row.sum,
      sortable: true,
    },
    {
      name: "Price",
      selector: (row) => row.price,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
    },
    {
      name: "Profit",
      selector: (row) => row.profit,
      sortable: true,
    },
    {
      name: "Date",
      selector: (row) => row.createdAt,
      sortable: true,
    },
  ];

  const dealsData = state?.map((order, i) => ({
    id: i + 1,
    type: order?.type,
    symbol: order?.symbol,
    sum: order?.volume,
    price: order?.symbolValue,
    status: order?.status,
    profit: order?.profit,
    createdAt: order?.createdAt,
  }));

  const userColumns = [
    {
      name: "ID",
      selector: (row) => row.id,
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
      cell: (row) =>
        row.surname === undefined ? row.name : row.name + " " + row.surname,
      sortable: true,
      width: "8%",
    },
    {
      name: "Status",
      cell: (row) => (
        <ProgressBar
          variant={progressBarConfig[row.status].variant}
          now={progressBarConfig[row.status].now}
          className="progressbar"
        />
      ),
      sortable: false,
      width: "8%",
    },
    {
      name: "Sale",
      selector: (row) => row.sale,
      sortable: true,
      width: "8%",
    },
    {
      name: "Reten",
      selector: (row) => row.reten,
      sortable: true,
      width: "8%",
    },
    {
      name: "Phone",
      selector: (row) => row.phone,
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
      selector: (row) => row.balance,
      sortable: true,
      width: "8%",
    },
    {
      name: "Deposit",
      selector: (row) => row.deposit,
      sortable: true,
      width: "8%",
    },
    {
      name: "Manager",
      selector: (row) => row.manager,
      sortable: true,
      width: "8%",
    },
    {
      name: "Affiliates",
      selector: (row) => row.affiliates,
      sortable: true,
      width: "8%",
    },
  ];

  const mappedData = users?.map((user, i) => ({
    ...user,
    status: user?.status,
    id: i + 1,
  }));

  return (
    <div id="mainboard">
      <Sidebar tab={tab} setTab={setTab} />
      <div id="profile">
        <img id="profile-pic" src={placeholder} alt="" />
        <div id="profile-i">
          <h5 className="f-w-inherit f-s-inherit" style={{ lineHeight: 1.1 }}>
            #11202
          </h5>
          <h4
            id="lead-name"
            className="f-w-inherit f-s-inherit"
            style={{ lineHeight: 1.1 }}
          >
            Тест Лид
          </h4>
        </div>
        <div id="profile-deals">
          <h4 style={{ lineHeight: 1.1 }}> Сделки</h4>
          <div id="sdelki-numbers">
            <div>
              <h5
                className="f-s-inherit  f-w-inherit "
                style={{ lineHeight: 1.1 }}
              >
                4
              </h5>
              <h5
                className="f-s-inherit  f-w-inherit "
                style={{ lineHeight: 1.1 }}
              >
                Открытые
              </h5>
            </div>
            <div>
              <h5
                className="f-s-inherit  f-w-inherit "
                style={{ lineHeight: 1.1 }}
              >
                5
              </h5>
              <h5
                className="f-s-inherit  f-w-inherit "
                style={{ lineHeight: 1.1 }}
              >
                Закрытые
              </h5>
            </div>
          </div>
        </div>
        <div id="profile-balance">
          <div>
            <div>
              <h5 className="text-left" style={{ lineHeight: 1.1 }}>
                Баланс
              </h5>
              <h4 className="text-left f-w-inherit" style={{ lineHeight: 1.1 }}>
                888.00
              </h4>
            </div>
            <div>
              <h5 className="text-left" style={{ lineHeight: 1.1 }}>
                Свободно
              </h5>
              <h4 className="text-left f-w-inherit" style={{ lineHeight: 1.1 }}>
                500.00
              </h4>
            </div>
            <div>
              <h5 className="text-left" style={{ lineHeight: 1.1 }}>
                Профит
              </h5>
              <h4 className="text-left f-w-inherit" style={{ lineHeight: 1.1 }}>
                180.00
              </h4>
            </div>
            <div>
              <h5 className="text-left" style={{ lineHeight: 1.1 }}>
                Бонус
              </h5>
              <h4 className="text-left f-w-inherit" style={{ lineHeight: 1.1 }}>
                50.00
              </h4>
            </div>
            <div>
              <h5 className="text-left" style={{ lineHeight: 1.1 }}>
                Заведено
              </h5>
              <h4 className="text-left f-w-inherit" style={{ lineHeight: 1.1 }}>
                100.00
              </h4>
            </div>
          </div>
          <div>
            <div>
              <h5 className="text-left" style={{ lineHeight: 1.1 }}>
                Залог
              </h5>
              <h4 className="text-left f-w-inherit" style={{ lineHeight: 1.1 }}>
                00.00
              </h4>
            </div>
            <div>
              <h5 className="text-left" style={{ lineHeight: 1.1 }}>
                Эквити
              </h5>
              <h4 className="text-left f-w-inherit" style={{ lineHeight: 1.1 }}>
                828.00
              </h4>
            </div>
            <div>
              <h5 className="text-left" style={{ lineHeight: 1.1 }}>
                Уровень маржи
              </h5>
              <h4 className="text-left f-w-inherit" style={{ lineHeight: 1.1 }}>
                88.05%
              </h4>
            </div>
            <div>
              <h5 className="text-left" style={{ lineHeight: 1.1 }}>
                Кредит
              </h5>
              <h4 className="text-left f-w-inherit" style={{ lineHeight: 1.1 }}>
                00.00
              </h4>
            </div>
            <div>
              <h5 className="text-left" style={{ lineHeight: 1.1 }}>
                Выведено
              </h5>
              <h4 className="text-left f-w-inherit" style={{ lineHeight: 1.1 }}>
                00.00
              </h4>
            </div>
          </div>
        </div>
        <div id="profile-referral-code">
          <h5>Referral code</h5>
          <input type="text" disabled="true" />
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
              <div id="menu1-main">
                <div id="menu1-main-titles">
                  <h4 className="f-s-inherit" style={{ lineHeight: 1.1 }}>
                    Documentation
                  </h4>
                  <button>Save</button>
                </div>
                <div>
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
                      {idFiles.map((file, index) => (
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
                          onChange={(e) =>
                            handleFileChange(e, setLocationFiles)
                          }
                        />
                      </div>
                    )}
                    <div className="d-flex align-items-center justify-content-between">
                      {locationFiles.map((file, index) => (
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
                      {mapFiles.map((file, index) => (
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
                      {placeFiles.map((file, index) => (
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
              </div>
              <div id="menu1-extra">
                <div id="menu1-extra-titles">
                  <h4 className="f-s-inherit" style={{ lineHeight: 1.1 }}>
                    Rights
                  </h4>
                  <button>Save</button>
                </div>
                <div className="form-check form-switch">
                  <label className="form-check-label f-s-inherit f-w-700">
                    Allow Trading
                  </label>
                  <input className="form-check-input" type="checkbox" />
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
              <div id="menu2-filter" className="dropdown">
                <button
                  className="btn dropdown-toggle"
                  type="button"
                  id="menu2Dropdown"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  Filter
                </button>
                <div className="dropdown-menu" aria-labelledby="menu2Dropdown">
                  <a
                    className="dropdown-item text-center"
                    href="#"
                    data-option="All operations"
                  >
                    All operations
                  </a>
                  <a
                    className="dropdown-item text-center"
                    href="#"
                    data-option="Extra"
                  >
                    Extra
                  </a>
                  <a
                    className="dropdown-item text-center"
                    href="#"
                    data-option="Trading"
                  >
                    Trading operations
                  </a>
                </div>
                <input
                  type="text"
                  id="leadsSearchInput"
                  onkeyup="leadsSearch()"
                  placeholder="Search.."
                />
              </div>
              <table
                id="lead-transactions-table"
                className="table table-hover table-striped"
              >
                <thead>
                  <tr>
                    <th scope="col" className="text-center">
                      ID
                    </th>
                    <th scope="col" className="text-center">
                      Type
                    </th>
                    <th scope="col" className="text-center">
                      Sum
                    </th>
                    <th scope="col" className="text-center">
                      Method
                    </th>
                    <th scope="col" className="text-center">
                      Card
                    </th>
                    <th scope="col" className="text-center">
                      Status
                    </th>
                    <th scope="col" className="text-center">
                      Date
                    </th>
                    <th scope="col" className="text-center">
                      FTD
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>Deposit</td>
                    <td>100</td>
                    <td>VISA</td>
                    <td>0000111100001111</td>
                    <td>Success</td>
                    <td>21/08/2023</td>
                    <td>Yes</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Withdrawal</td>
                    <td>200</td>
                    <td>MasterCard</td>
                    <td>1111000022223333</td>
                    <td>Pending</td>
                    <td>22/08/2023</td>
                    <td>No</td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>Transfer</td>
                    <td>150</td>
                    <td>PayPal</td>
                    <td>5555666677778888</td>
                    <td>Success</td>
                    <td>23/08/2023</td>
                    <td>Yes</td>
                  </tr>
                  <tr>
                    <td>4</td>
                    <td>Withdrawal</td>
                    <td>300</td>
                    <td>Bitcoin</td>
                    <td>0101010101010101</td>
                    <td>Failed</td>
                    <td>24/08/2023</td>
                    <td>No</td>
                  </tr>
                  <tr>
                    <td>5</td>
                    <td>Deposit</td>
                    <td>75</td>
                    <td>Bank Transfer</td>
                    <td>1001100010011000</td>
                    <td>Success</td>
                    <td>25/08/2023</td>
                    <td>Yes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {tab === 3 && (
            <div id="menu3">
              <div id="menu3-buttons">
                <button
                  id="menu3-edit"
                  className="btn btn-secondary"
                  onClick={edit}
                >
                  Edit
                </button>
                <button
                  id="menu3-save"
                  className="btn btn-secondary"
                  onClick={save}
                >
                  Save
                </button>
              </div>
              {!isEdit ? (
                <DataTable
                  columns={dealsColumns}
                  data={dealsData}
                  highlightOnHover
                  pointerOnHover
                  pagination
                  paginationPerPage={5}
                  paginationRowsPerPageOptions={[5, 10]}
                  // responsive
                />
              ) : (
                <table
                  id="menu3-table"
                  className="table table-hover table-striped"
                >
                  <thead>
                    <tr>
                      <th className="text-center" scope="col">
                        ID
                      </th>
                      <th className="text-center" scope="col">
                        Transaction Type
                      </th>
                      <th className="text-center" scope="col">
                        Symbol
                      </th>
                      <th className="text-center" scope="col">
                        Sum
                      </th>
                      <th className="text-center" scope="col">
                        Opening Price
                      </th>
                      <th className="text-center" scope="col">
                        Status
                      </th>
                      <th className="text-center" scope="col">
                        Profit
                      </th>
                      <th className="text-center" scope="col">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {state?.map((order, i) => (
                      <tr>
                        <td>{i + 1}</td>
                        <td>{order?.type}</td>
                        <td>{order?.symbol}</td>
                        <td>{order?.volume}</td>
                        <td>{order?.symbolValue}</td>
                        <td>{order?.status}</td>
                        <td>{order?.profit}</td>
                        <td>{order?.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === 4 && (
            <div id="menu4">
              <table className="table table-hover table-striped">
                <thead>
                  <tr>
                    <th className="text-center" scope="col">
                      Player
                    </th>
                    <th className="text-center" scope="col">
                      Date
                    </th>
                    <th className="text-center" scope="col">
                      Sum
                    </th>
                    <th className="text-center" scope="col">
                      Transaction ID
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Test</td>
                    <td>05-05-2023</td>
                    <td>$100</td>
                    <td>ID001</td>
                  </tr>
                  <tr>
                    <td>Test</td>
                    <td>01-12-2023</td>
                    <td>$50</td>
                    <td>ID002</td>
                  </tr>
                </tbody>
              </table>
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
                      placeholder="John Doe"
                      className="refInput"
                    />
                    <input
                      type="text"
                      placeholder="Qc1iOSzP"
                      className="refInput"
                    />
                  </div>
                </form>
              </div>
              <div className="ref-table">
                <p className="text-center my-3">Referred</p>
                <DataTable
                  columns={userColumns}
                  data={mappedData}
                  highlightOnHover
                  pointerOnHover
                  pagination
                  paginationPerPage={5}
                  paginationRowsPerPageOptions={[5, 10]}
                  responsive
                />
                {/* <table
                  id="refsTable"
                  className="table table-hover table-striped w-100"
                >
                  <thead>
                    <tr>
                      <th scope="col" className="text-center">
                        ID
                      </th>
                      <th scope="col" className="text-center">
                        Registered
                      </th>
                      <th scope="col" className="text-center">
                        Name
                      </th>
                      <th scope="col" className="text-center">
                        Status
                      </th>
                      <th scope="col" className="text-center">
                        Sale
                      </th>
                      <th scope="col" className="text-center">
                        Reten
                      </th>
                      <th scope="col" className="text-center">
                        Phone
                      </th>
                      <th scope="col" className="text-center">
                        Email
                      </th>
                      <th scope="col" className="text-center">
                        Balance
                      </th>
                      <th scope="col" clatab-contentssName="text-center">
                        Deposit
                      </th>
                      <th scope="col" className="text-center">
                        Manager
                      </th>
                      <th scope="col" className="text-center">
                        Affiliates
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.map((e, i) => (
                      <tr onClick={() => fetchOrders(e?.id)}>
                        <td>{i + 1}</td>
                        <td>{e?.createdAt}</td>
                        <td>
                          {e?.surname === undefined
                            ? e?.name
                            : e?.name + " " + e?.surname}
                        </td>
                        <td>
                          <ProgressBar
                            variant={progressBarConfig[e.status].variant}
                            now={progressBarConfig[e.status].now}
                            className="progressbar"
                          />
                        </td>

                        <td>{e?.sale}</td>
                        <td>{e?.reten}</td>
                        <td>{e?.phone}</td>
                        <td>{e?.email}</td>
                        <td>{e?.balance}</td>
                        <td>{e?.deposit}</td>
                        <td>{e?.manager}</td>
                        <td>{e?.affiliates}</td>
                      </tr>
                    ))}
                  </tbody>
                </table> */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
