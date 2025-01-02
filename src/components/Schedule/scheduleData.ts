interface ScheduleItem {
  day: string;
  time: string;
  className: string;
  instructor: string;
  level: string;
}

export const scheduleData: ScheduleItem[] = [
  {
    day: 'Monday',
    time: '9:00 AM',
    className: 'Ballet',
    instructor: 'Crystal Huang',
    level: 'Beginner'
  },
  {
    day: 'Monday',
    time: '4:00 PM',
    className: 'Jazz',
    instructor: 'Sarah Chen',
    level: 'Intermediate'
  },
  {
    day: 'Tuesday',
    time: '10:30 AM',
    className: 'Contemporary',
    instructor: 'Michael Zhang',
    level: 'Advanced'
  },
  {
    day: 'Wednesday',
    time: '5:30 PM',
    className: 'Hip Hop',
    instructor: 'James Wilson',
    level: 'All Levels'
  },
  {
    day: 'Thursday',
    time: '7:00 PM',
    className: 'Ballet',
    instructor: 'Crystal Huang',
    level: 'Advanced'
  },
  {
    day: 'Friday',
    time: '4:00 PM',
    className: 'Contemporary',
    instructor: 'Michael Zhang',
    level: 'Intermediate'
  },
  {
    day: 'Saturday',
    time: '9:00 AM',
    className: 'Jazz',
    instructor: 'Sarah Chen',
    level: 'Beginner'
  },
  {
    day: 'Saturday',
    time: '2:00 PM',
    className: 'Hip Hop',
    instructor: 'James Wilson',
    level: 'Intermediate'
  }
];