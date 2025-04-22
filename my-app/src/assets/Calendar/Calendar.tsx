import * as React from 'react';
import { Calendar } from '@fluentui/react-calendar-compat';

export const CalendarSixWeeks = () => {
  const [selectedDate, setSelectedDate] = React.useState<Date>();

  const onSelectDate = React.useCallback((date: Date): void => {
    setSelectedDate(date);
  }, []);

  return (
    <>
      <div className="form-wrapper">
        <div className="form">
          <div>Selected date: {selectedDate?.toDateString() || 'Not set'}</div>

          <Calendar
            showSixWeeksByDefault
            showGoToToday
            onSelectDate={onSelectDate}
            value={selectedDate}
          />
        </div>
      </div>
    </>
  );
};
