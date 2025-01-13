"use client";

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
import { useRouter } from "next/navigation";

const CalendarComponent = ({ params }) => {
  const [busyDates, setBusyDates] = useState([]);
  const [id, setId] = useState("");
  const [artistName, setArtistName] = useState("");
  const months = Array.from({ length: 13 }, (_, i) => addMonths(new Date(), i));
  const router = useRouter();

  const getArtist = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/artist/artistName/${params.artist}`
      );
      const artistData = response.data;
      setId(artistData._id);
      setArtistName(artistData.name);
      setBusyDates(artistData.busyDates.map((date) => new Date(date)));
    } catch (error) {
      console.error("Error fetching artists:", error);
    }
  };

  useEffect(() => {
    getArtist();
  }, []);

  const onChange = (date) => {
    const normalizedDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    if (
      busyDates.some((busyDate) =>
        isSameDay(new Date(busyDate), normalizedDate)
      )
    ) {
      setBusyDates(
        busyDates.filter(
          (busyDate) => !isSameDay(new Date(busyDate), normalizedDate)
        )
      );
    } else {
      setBusyDates([...busyDates, normalizedDate]);
    }
  };

  const saveDates = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/busyDates/${id}`,
        {
          busyDates: busyDates.map((date) => date.toISOString().split("T")[0]),
        },
        { withCredentials: true }
      );
      console.log("Dates saved successfully:", response.data);
      router.push("/");
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
            className={`p-2 mb-2 text-center cursor-pointer rounded-full w-10 h-10 flex items-center justify-center ${
              !isSameMonth(day, startMonth) || isBefore(day, new Date())
                ? "text-gray-400 cursor-default"
                : ""
            } ${
              busyDates.some((busyDate) => isSameDay(new Date(busyDate), day))
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
    <div className="p-4">
      <div className="sticky top-8 bg-white z-10 ">
        <div className="flex justify-between items-center py-2">
          <button
            className="bg-black text-white px-4 py-2 rounded-md"
            onClick={() => router.push("/")}
          >
            Back to Dashboard
          </button>
          <button
            className="bg-primary text-white px-4 py-2 rounded-md"
            onClick={saveDates}
          >
            Save Changes
          </button>
        </div>
        <hr className="mb-4" />
      </div>
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
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div className="text-center font-semibold" key={day}>
                  {day}
                </div>
              ))}
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
  );
};

export default CalendarComponent;
