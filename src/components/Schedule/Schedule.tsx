import React from 'react';
import WeeklySchedule from './WeeklySchedule';
import { ScheduleHeader } from './ScheduleHeader';

const Schedule = () => {
  return (
    <section id="schedule" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScheduleHeader />
        <WeeklySchedule />
      </div>
    </section>
  );
};

export default Schedule;