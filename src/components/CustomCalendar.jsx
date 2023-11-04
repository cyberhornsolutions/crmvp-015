// import React from "react";
// import Calendar from "rsuite/Calendar";
// import "rsuite/dist/rsuite.min.css";

// export default function CustomCalendar({
//   showModal,
//   checkEvent,
//   handleCellClick,
// }) {
//   return (
//     <Calendar
//       bordered
//       onSelect={(date) => handleCellClick(date)}
//       renderCell={(date) => {
//         return <div className="custom-cell">{checkEvent(date)}</div>;
//       }}
//     />
//   );
// }

import { useEffect, useState } from "react";
import moment from "moment/moment";
import s from "./Calendar.module.css";
import { Button, ButtonGroup } from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useDispatch, useSelector } from "react-redux";
import { TOTAL_DAYS, WEEK_DAYS } from "../config/constants";
import { ModalForm } from "./ModalForm.jsx";
import { filterEvents } from "../redux/calendar/calendarReducer";
import { EventListComponent } from "./EventListComponent/EventListComponent";

export default function CustomCalendar() {
  const [open, setOpen] = useState(false);
  const [today, setToday] = useState(moment());
  const [selectedDayUnix, setSelectedDayUnix] = useState(null);
  const [localEvents, setLocalEvents] = useState([]);
  const events = useSelector(({ calendar }) => calendar.currentEvents);
  const dispatch = useDispatch();

  const handleOpen = (dayItem) => {
    setSelectedDayUnix(dayItem);
    const currentDate = moment.unix(dayItem);

    if (isPastDays(currentDate) && isSelectedMonth(currentDate)) {
      setOpen(true);
    }
  };
  const handleClose = () => setOpen(false);

  moment.updateLocale("uk", { week: { dow: 1 } });
  const startDay = today.clone().startOf("month").startOf("week");
  const day = startDay.clone().subtract(1, "days");
  const calendarFoolArr = [...Array(TOTAL_DAYS)].map(() =>
    day.add(1, "day").clone()
  );
  const weekDaysArr = [...Array(WEEK_DAYS)].map(() =>
    day.add(1, "day").clone()
  );

  const isCurrentDay = (day) => moment().isSame(day, "day");
  const isSelectedMonth = (day) => today.isSame(day, "month");
  const isPastDays = (day) => moment().subtract(1, "day").isBefore(day, "day");

  const prevRandler = () =>
    setToday((prev) => prev.clone().subtract(1, "month"));
  const nextRandler = () => setToday((prev) => prev.clone().add(1, "month"));

  const startDateQuery = startDay.clone().format("X");
  const endDateQuery = startDay.clone().add(TOTAL_DAYS, "day").format("X");

  useEffect(() => {
    if (startDay) {
      dispatch(filterEvents({ startDateQuery, endDateQuery }));
    }
  }, [startDateQuery, endDateQuery]);

  useEffect(() => {
    setLocalEvents(events);
  }, [events]);

  return (
    <div className={s.calendarGrid}>
      <div className={s.nameMonthWrapper}>
        <p className={s.nameMonth}>
          {today.format("MMMM")}{" "}
          <span className={s.year}>{today.format("YYYY")}</span>
        </p>
      </div>

      <div className={s.wrapperNameDay}>
        {weekDaysArr.map((day) => {
          return (
            <p key={day} className={s.nameDay}>
              {day.format("ddd")}
            </p>
          );
        })}
      </div>

      <ButtonGroup
        className={s.buttonGroup}
        size="small"
        aria-label="small button group"
      >
        <Button className={s.btn} onClick={prevRandler}>
          <NavigateBeforeIcon />
        </Button>
        <Button className={s.btn} onClick={nextRandler}>
          <NavigateNextIcon />
        </Button>
      </ButtonGroup>

      {calendarFoolArr.map((dayItem) => {
        return (
          <div
            className={
              (!isSelectedMonth(dayItem) && s.notСurrentMonth) ||
              (!isPastDays(dayItem) ? s.stopClik : s.pointerNormal)
            }
            key={dayItem.unix()}
            onClick={() => handleOpen(dayItem.unix())}
          >
            <div className={!isCurrentDay(dayItem) ? s.dayBox : s.currentDay}>
              <div
                className={
                  dayItem.day() === 6 || dayItem.day() === 0 ? s.weekend : null
                }
              >
                <p className={s.numStyle}>{dayItem.format("D")}</p>
              </div>
              <EventListComponent dayItem={dayItem} localEvents={localEvents} />
            </div>
          </div>
        );
      })}

      <ModalForm
        open={open}
        handleClose={handleClose}
        selectedDayUnix={selectedDayUnix}
        localEvents={localEvents}
        setLocalEvents={setLocalEvents}
      />
    </div>
  );
}
