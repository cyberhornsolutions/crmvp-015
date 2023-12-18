import React, { useRef, useState } from "react";
import CustomCalendar from "./CustomCalendar";

export default function Calendar() {
  const [show, setShow] = useState(false);
  const [data, setData] = useState({ date: null, title: "", color: "blue" });
  const [events, setEvents] = useState([
    { title: "Holidays", date: new Date("10-10-2023"), color: "green" },
  ]);

  const save = () => {
    if (data.date && data.color && data.title) {
      let _data = [...events];
      _data.push({ date: data.date, color: data.color, title: data.title });
      setEvents(_data);
      setData({ date: null, title: "", color: "blue" });
      setShow(false);
    }
  };

  const cancel = () => {
    setData({ date: null, title: "", color: "blue" });
    setShow(false);
  };

  const getStyles = (color) => {
    if (color === "yellow") {
      return { backgroundColor: "#FFFFF0", color: "#975a16" };
    }
    if (color === "blue") {
      return { backgroundColor: "#ebf8ff", color: "#2c5282" };
    }
    if (color === "red") {
      return { backgroundColor: "#fff5f5", color: "#9b2c2c" };
    }
    if (color === "green") {
      return { backgroundColor: "#f0fff4", color: "#276749" };
    }
    if (color === "purple") {
      return { backgroundColor: "#faf5ff", color: "#553c9a" };
    }
  };

  const checkEvent = (date) => {
    let a = new Date(date);

    const year1 = a.getFullYear();
    const month1 = a.getMonth();
    const day1 = a.getDate();

    for (let index = 0; index < events.length; index++) {
      const element = events[index];
      let b = new Date(element.date);
      const year2 = b.getFullYear();
      const month2 = b.getMonth();
      const day2 = b.getDate();

      if (year1 === year2) {
        if (month1 === month2) {
          if (day1 === day2) {
            return (
              <div className="event-calendar" style={getStyles(element?.color)}>
                {element?.title}
              </div>
            );
          }
        }
      }
    }
  };

  const handleCellClick = (date) => {
    setData({ ...data, date: new Date(date) });
    setShow(true);
  };

  return (
    <>
      {show && (
        <div className="calendar-modal">
          <div
            className="cross shadow absolute right-0 top-0 translate-middle w-6 h-6 rounded-full bg-white text-gray-500 hover:text-gray-800 p-0 d-flex items-center justify-center cursor-pointer"
            x-on:click="openEventModal = !openEventModal"
          >
            <svg
              className="fill-current w-6 h-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M16.192 6.344L11.949 10.586 7.707 6.344 6.293 7.758 10.535 12 6.293 16.242 7.707 17.656 11.949 13.414 16.192 17.656 17.606 16.242 13.364 12 17.606 7.758z" />
            </svg>
          </div>
          <div className="title">Добавить детали события</div>
          <div>
            <div className="subtitle">Заголовок</div>
            <input
              className="bg-gray-200 appearance-none border-2 border-gray-200 rounded-lg w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
            />
          </div>
          <div>
            <div className="subtitle">Дата</div>
            <input
              className="bg-gray-200 appearance-none border-2 border-gray-200 rounded-lg w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
              value={new Date(data.date).toLocaleDateString()}
              onChange={(e) => {
                setData({ ...data, date: e.target.value });
              }}
            />
          </div>
          <div className="w-100">
            <div className="subtitle">Дата</div>
            <select
              className="block appearance-none mx-auto  w-full bg-gray-200 border-2 border-gray-200 hover:border-gray-500 px-4 py-2 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-gray-700"
              value={data.color}
              onChange={(e) => setData({ ...data, color: e.target.value })}
            >
              <option value="blue">Blue</option>
              <option value="red">Red</option>
              <option value="yellow">Yellow</option>
              <option value="green">Green</option>
              <option value="purple">Purple</option>
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "end" }}>
            <button className="cancel" onClick={cancel}>
              Cancel
            </button>
            <button className="save" onClick={save}>
              Save
            </button>
          </div>
        </div>
      )}
      <CustomCalendar
        showModal={setShow}
        checkEvent={checkEvent}
        handleCellClick={handleCellClick}
      />
    </>
  );
}
