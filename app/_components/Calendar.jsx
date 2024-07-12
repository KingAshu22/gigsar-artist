import { useState } from "react";
import {
  format,
  addMonths,
  startOfMonth,
  endOfMonth,
  addDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isSameMonth,
} from "date-fns";

const Calendar = () => {
  const [selectedDates, setSelectedDates] = useState([]);
  const today = new Date();
  const monthsToDisplay = 12;

  const toggleDate = (date) => {
    const dateString = format(date, "yyyy-MM-dd");
    setSelectedDates((prevSelectedDates) =>
      prevSelectedDates.includes(dateString)
        ? prevSelectedDates.filter(
            (selectedDate) => selectedDate !== dateString
          )
        : [...prevSelectedDates, dateString]
    );
  };

  const renderCalendar = () => {
    const months = [];
    for (let i = 0; i <= monthsToDisplay; i++) {
      const monthStart = startOfMonth(addMonths(today, i));
      const monthEnd = endOfMonth(monthStart);
      const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
      const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

      let days = [];
      let day = startDate;

      while (day <= endDate) {
        const dateString = format(day, "yyyy-MM-dd");
        days.push(
          <div
            key={dateString}
            className={`flex justify-center items-center h-10 w-10 m-1 cursor-pointer rounded ${
              isSameMonth(day, monthStart)
                ? selectedDates.includes(dateString)
                  ? "bg-red-500 text-white"
                  : "bg-green-500 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            onClick={() => isSameMonth(day, monthStart) && toggleDate(day)}
          >
            {format(day, "d")}
          </div>
        );
        day = addDays(day, 1);
      }

      months.push(
        <div key={monthStart} className="m-4 p-4 border rounded max-w-lg">
          <h2 className="text-xl font-bold mb-2">
            {format(monthStart, "MMMM yyyy")}
          </h2>
          <div className="grid grid-cols-7 gap-1 text-center font-bold">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>
          <div className="grid grid-cols-7 gap-1 mt-2">{days}</div>
        </div>
      );
    }
    return months;
  };

  return (
    <div>
      <div className="h-[80vh] overflow-y-auto">
        <div className="flex flex-col items-center">{renderCalendar()}</div>
      </div>
      <div className="flex justify-center mt-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded mx-2"
          onClick={() => alert("Saved!")}
        >
          Save
        </button>
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded mx-2"
          onClick={() => setSelectedDates([])}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Calendar;
