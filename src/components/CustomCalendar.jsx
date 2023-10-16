import React from "react";
import Calendar from "rsuite/Calendar";
import "rsuite/dist/rsuite.min.css";

export default function CustomCalendar({
  showModal,
  checkEvent,
  handleCellClick,
}) {
  return (
    <Calendar
      bordered
      onSelect={(date) => handleCellClick(date)}
      renderCell={(date) => {
        return <div className="custom-cell">{checkEvent(date)}</div>;
      }}
    />
  );
}
