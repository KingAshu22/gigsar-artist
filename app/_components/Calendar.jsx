// CalendarComponent.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  addMonths,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isBefore,
} from "date-fns";

const CalendarComponent = ({ params }) => {
  const getArtist = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/artist/artistName/${params.artist}`
      );
      const artistData = response.data;

      setArtistName(artistData.name);
    } catch (error) {
      console.error("Error fetching artists:", error);
    } finally {
      setFetchData(true);
    }
  };

  const [busyDates, setBusyDates] = useState([]);
  const [artistName, setArtistName] = useState("");
  const [fetchData, setFetchData] = useState(false);
  const months = Array.from({ length: 13 }, (_, i) => addMonths(new Date(), i));

  useEffect(() => {
    getArtist();
  }, []);

  const onChange = (date) => {
    if (busyDates.some((busyDate) => isSameDay(busyDate, date))) {
      setBusyDates(busyDates.filter((busyDate) => !isSameDay(busyDate, date)));
    } else {
      setBusyDates([...busyDates, date]);
    }
  };

  const saveDates = async () => {
    try {
      const response = await axios.post("/api/save-busy-dates", { busyDates });
      console.log("Dates saved successfully:", response.data);
    } catch (error) {
      console.error("Error saving dates:", error);
    }
  };

  const renderDays = (month) => {
    const startMonth = startOfMonth(month);
    const endMonth = endOfMonth(month);
    const startDate = startOfWeek(startMonth);
    const endDate = endOfWeek(endMonth);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;

        days.push(
          <div
            className={`p-2 text-center cursor-pointer rounded-xl ${
              !isSameMonth(day, startMonth) || isBefore(day, new Date())
                ? "text-gray-400"
                : ""
            } ${
              busyDates.some((busyDate) => isSameDay(busyDate, day))
                ? "bg-red-500 text-white"
                : ""
            }`}
            key={day}
            onClick={() => !isBefore(day, new Date()) && onChange(cloneDay)}
          >
            <span>{format(day, "d")}</span>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    fetchData && (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">
          Artist Availability Calendar for {artistName}
        </h1>
        <div className="space-y-4">
          {months.map((month, index) => (
            <div className="bg-white rounded-lg shadow-md p-4" key={index}>
              <div className="text-center font-semibold mb-2">
                {format(month, "MMMM yyyy")}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div className="text-center font-semibold" key={day}>
                      {day}
                    </div>
                  )
                )}
              </div>
              {renderDays(month)}
            </div>
          ))}
        </div>
        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={saveDates}
        >
          Save Busy Dates
        </button>
      </div>
    )
  );
};

export default CalendarComponent;
