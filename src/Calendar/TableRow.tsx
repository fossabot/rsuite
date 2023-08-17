import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import partial from 'lodash/partial';
import { DateUtils, useClassNames, DATERANGE_DISABLED_TARGET, useCustom } from '../utils';
import { useCalendarContext } from './CalendarContext';
import { RsRefForwardingComponent, WithAsProps } from '../@types/common';

export interface TableRowProps extends WithAsProps {
  weekendDate?: Date;
}

const TableRow: RsRefForwardingComponent<'div', TableRowProps> = React.forwardRef(
  (props: TableRowProps, ref) => {
    const {
      as: Component = 'div',
      className,
      classPrefix = 'calendar-table',
      weekendDate = new Date(),
      ...rest
    } = props;
    const {
      date: selected = new Date(),
      dateRange,
      disabledDate,
      hoverRangeValue,
      inSameMonth,
      isoWeek,
      onMouseMove,
      onSelect,
      cellClassName,
      renderCell,
      locale: overrideLocale,
      showWeekNumbers
    } = useCalendarContext();
    const { locale, formatDate } = useCustom('Calendar', overrideLocale);
    const { prefix, merge } = useClassNames(classPrefix);

    const handleSelect = useCallback(
      (date: Date, disabled: boolean | void, event: React.MouseEvent) => {
        if (disabled) {
          return;
        }

        onSelect?.(date, event);
      },
      [onSelect]
    );

    const renderDays = () => {
      const formatStr = locale.formattedDayPattern;
      const days: React.ReactElement[] = [];
      const [selectedStartDate, selectedEndDate] = dateRange || [];
      const [hoverStartDate, hoverEndDate] = hoverRangeValue ?? [];
      const isRangeSelectionMode = typeof dateRange !== 'undefined';
      const todayDate = new Date();

      for (let i = 0; i < 7; i += 1) {
        const thisDate = DateUtils.addDays(weekendDate, i);
        const disabled = disabledDate?.(thisDate, dateRange, DATERANGE_DISABLED_TARGET.CALENDAR);
        const isToday = DateUtils.isSameDay(thisDate, todayDate);
        const unSameMonth = !inSameMonth?.(thisDate);
        const isStartSelected =
          !unSameMonth && selectedStartDate && DateUtils.isSameDay(thisDate, selectedStartDate);
        const isEndSelected =
          !unSameMonth && selectedEndDate && DateUtils.isSameDay(thisDate, selectedEndDate);
        const isSelected = isRangeSelectionMode
          ? isStartSelected || isEndSelected
          : DateUtils.isSameDay(thisDate, selected);

        // TODO-Doma Move those logic that's for DatePicker/DateRangePicker to a separate component
        //           Calendar is not supposed to be reused this way
        let inRange = false;
        // for Selected
        if (selectedStartDate && selectedEndDate) {
          if (
            DateUtils.isBefore(thisDate, selectedEndDate) &&
            DateUtils.isAfter(thisDate, selectedStartDate)
          ) {
            inRange = true;
          }
          if (
            DateUtils.isBefore(thisDate, selectedStartDate) &&
            DateUtils.isAfter(thisDate, selectedEndDate)
          ) {
            inRange = true;
          }
        }

        // for Hovering
        if (!isSelected && hoverStartDate && hoverEndDate) {
          if (
            !DateUtils.isAfter(thisDate, hoverEndDate) &&
            !DateUtils.isBefore(thisDate, hoverStartDate)
          ) {
            inRange = true;
          }
          if (
            !DateUtils.isAfter(thisDate, hoverStartDate) &&
            !DateUtils.isBefore(thisDate, hoverEndDate)
          ) {
            inRange = true;
          }
        }

        const classes = merge(
          prefix('cell', {
            'cell-un-same-month': unSameMonth,
            'cell-is-today': isToday,
            'cell-selected': isSelected,
            'cell-selected-start': isStartSelected,
            'cell-selected-end': isEndSelected,
            'cell-in-range': !unSameMonth && inRange,
            'cell-disabled': disabled
          }),
          cellClassName?.(thisDate)
        );

        const title = formatDate
          ? formatDate(thisDate, formatStr)
          : DateUtils.format(thisDate, formatStr);
        days.push(
          <div
            role="gridcell"
            key={title}
            aria-label={title}
            aria-selected={isSelected || undefined}
            className={classes}
          >
            <div
              role="button"
              className={prefix('cell-content')}
              tabIndex={-1}
              title={isToday ? `${title} (${locale?.today})` : title}
              onMouseEnter={!disabled && onMouseMove ? onMouseMove.bind(null, thisDate) : undefined}
              onClick={partial(handleSelect, thisDate, disabled)}
            >
              <span className={prefix('cell-day')}>{DateUtils.getDate(thisDate)}</span>
              {renderCell && renderCell(thisDate)}
            </div>
          </div>
        );
      }
      return days;
    };

    const classes = merge(className, prefix('row'));

    return (
      <Component {...rest} ref={ref} role="row" className={classes}>
        {showWeekNumbers && (
          <div className={prefix('cell-week-number')} role="rowheader">
            {DateUtils.format(weekendDate, isoWeek ? 'I' : 'w')}
          </div>
        )}
        {renderDays()}
      </Component>
    );
  }
);

TableRow.displayName = 'CalendarTableRow';
TableRow.propTypes = {
  weekendDate: PropTypes.instanceOf(Date),
  className: PropTypes.string,
  classPrefix: PropTypes.string
};

export default TableRow;
