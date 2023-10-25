import React from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
  Box,
  Button,
} from "@mui/material";
import s from "./ModalForm.module.css";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { uid } from "uid";
import moment from "moment";
import { addEvent } from "../redux/calendar/calendarReducer";
// import {
//   onError,
//   onSuccess,
//   onWarning,
// } from "../../../components/Error/ErrorMessages";

export function ModalForm({
  open,
  handleClose,
  selectedDayUnix,
  setLocalEvents,
  localEvents,
}) {
  const dispatch = useDispatch();
  const currentDate = moment.unix(selectedDayUnix);
  const currentNumber = currentDate.format("D");
  const currentTime = moment().format("HH:mm");

  return (
    <div>
      <Modal
        className={s.modal}
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className={s.modalContent}>
          <Typography variant="h6" component="h2">
            Create an Event for {currentNumber}
          </Typography>

          <Formik
            initialValues={{
              id: uid(),
              title: "",
              started_at: "",
              finished_at: "",
              date: selectedDayUnix,
            }}
            validationSchema={Yup.object().shape({
              title: Yup.string().required("Event type is missing"),
              started_at: Yup.string().required("Start time is missing"),
              finished_at: Yup.string().required("End time is missing"),
            })}
            onSubmit={(values) => {
              dispatch(addEvent(values));
              handleClose();

              setLocalEvents([...localEvents, values]);

              onSuccess(`Удачно создана задача на ${currentNumber} число`);
            }}
          >
            {(props) => {
              const {
                values,
                touched,
                errors,
                handleChange,
                handleBlur,
                handleSubmit,
                setFieldValue,
              } = props;

              const handleChangeTime = (e, fieldName) => {
                var timeValue = e.target.value;
                if (currentTime >= timeValue) {
                  // onWarning("Не верно выбрано время");
                  console.log("Не верно выбрано время");
                  setFieldValue(fieldName, currentTime);
                } else {
                  setFieldValue(fieldName, timeValue);
                }
              };

              return (
                <>
                  <form
                    className={s.form}
                    onSubmit={(e) => {
                      e.preventDefault();
                      console.log(e);
                      handleSubmit(e);
                    }}
                  >
                    <p className={s.labelMargin}>Select Event</p>
                    <FormControl sx={{ m: 1, width: 223 }} size="small">
                      {/* <InputLabel>Event</InputLabel> */}
                      <Select
                        className={s.input}
                        // label="Опции"
                        name="title"
                        value={values.title}
                        onChange={handleChange}
                      >
                        <MenuItem value={"ringing"}>Ringing</MenuItem>
                        <MenuItem value={"meeting"}>Meeting</MenuItem>
                        <MenuItem value={"presentation"}>Presentation</MenuItem>
                      </Select>
                      {errors.title && touched.title ? (
                        <div className={s.formErrorContent}>{errors.title}</div>
                      ) : (
                        <div className={s.errorBox}></div>
                      )}
                    </FormControl>

                    <p className={s.labelMargin}>Event Time</p>

                    <div className={s.inputWrapper}>
                      <label className={s.inputLabel}>
                        <p>Start Time</p>
                        <TextField
                          className={s.input}
                          sx={{ mr: 1 }}
                          size="small"
                          type="time"
                          value={values.started_at}
                          onChange={(e) => handleChangeTime(e, "started_at")}
                          onBlur={handleBlur}
                        />
                        {errors.started_at && touched.started_at ? (
                          <div className={s.formErrorContent}>
                            {errors.started_at}
                          </div>
                        ) : (
                          <div className={s.errorBox}></div>
                        )}
                      </label>

                      <label className={s.inputLabel}>
                        <p>End Time</p>
                        <TextField
                          className={s.input}
                          size="small"
                          type="time"
                          onChange={(e) => handleChangeTime(e, "finished_at")}
                          value={values.finished_at}
                          onBlur={handleBlur}
                        />
                        {errors.finished_at && touched.finished_at ? (
                          <div className={s.formErrorContent}>
                            {errors.finished_at}
                          </div>
                        ) : (
                          <div className={s.errorBox}></div>
                        )}
                      </label>
                    </div>

                    <Box sx={{ mt: 1 }}>
                      <Button type="submit">
                        <span>Save Event</span>
                      </Button>
                      <Button sx={{ mr: 1 }} onClick={handleClose}>
                        <span>Close</span>
                      </Button>
                    </Box>
                  </form>
                </>
              );
            }}
          </Formik>
        </Box>
      </Modal>
    </div>
  );
}
