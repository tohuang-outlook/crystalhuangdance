import React from 'react';
import { scheduleData } from './scheduleData';

const WeeklySchedule = () => {
  const timeSlots = ['9:00 AM', '10:30 AM', '2:00 PM', '4:00 PM', '5:30 PM', '7:00 PM'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th className="border p-3 bg-purple-50">Time</th>
            {days.map((day) => (
              <th key={day} className="border p-3 bg-purple-50">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((time) => (
            <tr key={time}>
              <td className="border p-3 font-medium bg-purple-50">{time}</td>
              {days.map((day) => {
                const classInfo = scheduleData.find(
                  (item) => item.day === day && item.time === time
                );
                return (
                  <td key={`${day}-${time}`} className="border p-3">
                    {classInfo && (
                      <div className="text-sm">
                        <p className="font-semibold text-purple-600">{classInfo.className}</p>
                        <p className="text-gray-600">{classInfo.instructor}</p>
                        <p className="text-gray-500 text-xs">{classInfo.level}</p>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WeeklySchedule;