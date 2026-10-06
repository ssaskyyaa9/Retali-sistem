"use client";
import React, { useState } from "react";
import Header from "@/app/components/Header";
import { CalendarIcon, PlusIcon } from "@/app/components/CustomIcons";

export default function ItineraryScreen() {
  const [view, setView] = useState(0); // 0 = List View, 1 = Add Form
  const [activeDay, setActiveDay] = useState(1);

  return (
    <div className="p-10 w-full max-w-5xl">
      {/* LIST VIEW[cite: 19, 20] */}
      {view === 0 && (
        <div>
          <Header
            title="Itinerary"
            icon={<CalendarIcon />}
            buttonIcon={<PlusIcon />}
            buttonOnClick={() => setView(1)}
            buttonText="Add Schedule"
          />

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`px-4 py-1.5 rounded text-xs font-bold transition-colors ${activeDay === day ? "bg-[#263754] text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
                  >
                    Day {day}
                  </button>
                ))}
              </div>
              <select className="border border-gray-300 rounded px-4 py-1.5 text-sm font-bold bg-white text-gray-700">
                <option>05 - 11 - 2025</option>
              </select>
            </div>

            <table className="w-full text-center text-sm">
              <thead>
                <tr className="border border-gray-200">
                  <th className="px-6 py-3 font-bold text-gray-800 border-r border-gray-200">
                    Time
                  </th>
                  <th className="px-6 py-3 font-bold text-gray-800 border-r border-gray-200 w-1/2">
                    Location
                  </th>
                  <th className="px-6 py-3 font-bold text-gray-800">Action</th>
                </tr>
              </thead>
              <tbody className="font-bold text-gray-700 divide-y divide-gray-100">
                <tr>
                  <td className="px-6 py-4 border-r border-gray-200">08:00</td>
                  <td className="px-6 py-4 border-r border-gray-200 text-left">
                    Breakfast at hotel
                  </td>
                  <td className="px-6 py-4 flex justify-center gap-4 text-[#263754]">
                    <button className="flex items-center gap-1 hover:text-blue-600">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>{" "}
                      Edit
                    </button>
                    <button className="hover:text-red-600">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 border-r border-gray-200">10:00</td>
                  <td className="px-6 py-4 border-r border-gray-200 text-left">
                    Ziarah to Quba Mosque
                  </td>
                  <td className="px-6 py-4 flex justify-center gap-4 text-[#263754]">
                    <button className="flex items-center gap-1 hover:text-blue-600">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>{" "}
                      Edit
                    </button>
                    <button className="hover:text-red-600">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FORM VIEW[cite: 21] */}
      {view === 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-[#263754] mb-8 pb-4 border-b">
            Add Schedule
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Package
              </label>
              <input
                type="text"
                defaultValue="Umrah super cermat"
                className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  City
                </label>
                <select className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm bg-white">
                  <option>Madinah</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Day
                </label>
                <select className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm bg-white">
                  <option>Day 1</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  defaultValue="08:00"
                  className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Duration
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    defaultValue="1"
                    className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm"
                  />
                  <span className="flex items-center text-sm font-medium">
                    hr
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Date
              </label>
              <input
                type="text"
                defaultValue="05 - 11 - 2025"
                className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Location
              </label>
              <input
                type="text"
                defaultValue="Breakfast at hotel"
                className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Notes
              </label>
              <textarea
                rows="4"
                className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm"
              ></textarea>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={() => setView(0)}
              className="bg-[#263754] text-white px-8 py-2.5 rounded font-bold text-sm hover:bg-[#3d547a]"
            >
              Save
            </button>
            <button className="bg-blue-600 text-white px-8 py-2.5 rounded font-bold text-sm hover:bg-blue-700">
              Publish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
