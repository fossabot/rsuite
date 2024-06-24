import React, { useCallback, useMemo } from 'react';
import { getDaysInMonth, getMonth, getYear } from '@/internals/utils/date';
import { AutoSizer, FixedSizeList, ListChildComponentProps } from '@/internals/Windowing';
import { useClassNames, useDateTimeFormat } from '@/internals/hooks';
import MonthDropdownItem from './MonthDropdownItem';
import { RsRefForwardingComponent, WithAsProps } from '@/internals/types';
import { useCalendarContext } from './CalendarContext';

export interface MonthDropdownProps extends WithAsProps {
  show?: boolean;
  limitStartYear?: number;
  limitEndYear?: number;
  height?: number;
  width?: number;
  disabledMonth?: (date: Date) => boolean;
}

export interface RowProps {
  /** Index of row */
  index: number;

  /** The List is currently being scrolled */
  isScrolling: boolean;

  /** This row is visible within the List (eg it is not an overscanned row) */
  isVisible: boolean;

  /** Unique key within array of rendered rows */
  key?: any;

  /** Reference to the parent List (instance) */
  parent: any;

  /** Style object to be applied to row (to position it); */
  style?: React.CSSProperties;
}

const monthMap = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export function isEveryDateInMonth(
  year: number,
  month: number,
  predicate: (date: Date) => boolean
): boolean {
  const days = getDaysInMonth(new Date(year, month));

  for (let i = 1; i <= days; i++) {
    if (!predicate(new Date(year, month, i))) {
      return false;
    }
  }
  return true;
}

const MonthDropdown: RsRefForwardingComponent<'div', MonthDropdownProps> = React.forwardRef(
  (props: MonthDropdownProps, ref) => {
    const {
      as: Component = 'div',
      className,
      classPrefix = 'calendar-month-dropdown',
      limitStartYear,
      limitEndYear = 5,
      show,
      height: defaultHeight = 221,
      width: defaultWidth = 256,
      disabledMonth,
      ...rest
    } = props;

    const { date = new Date(), targetId } = useCalendarContext();
    const { prefix, merge, withClassPrefix } = useClassNames(classPrefix);
    const { formatYear } = useDateTimeFormat();
    const thisYear = getYear(new Date());
    const startYear = limitStartYear ? thisYear - limitStartYear + 1 : 1900;

    const rowCount = useMemo(() => {
      const endYear = thisYear + limitEndYear;

      return endYear - startYear;
    }, [limitEndYear, startYear, thisYear]);

    const isMonthDisabled = useCallback(
      (year, month) => {
        if (disabledMonth) {
          return isEveryDateInMonth(year, month, disabledMonth);
        }

        return false;
      },
      [disabledMonth]
    );

    const rowRenderer = useCallback(
      ({ index, style }: ListChildComponentProps) => {
        const selectedMonth = getMonth(date);
        const selectedYear = getYear(date);
        const year = startYear + index;
        const isSelectedYear = year === selectedYear;
        const titleClassName = prefix('year', { 'year-active': isSelectedYear });

        const rowClassName = merge(prefix('row'), {
          'first-row': index === 0,
          'last-row': index === rowCount - 1
        });

        const yearText = formatYear(new Date(year, 0, 1));

        return (
          <div className={rowClassName} role="row" aria-label={yearText} style={style}>
            <div className={titleClassName} role="rowheader">
              {yearText}
            </div>
            <div className={prefix('list')}>
              {monthMap.map((item, month) => {
                return (
                  <MonthDropdownItem
                    disabled={isMonthDisabled(year, month)}
                    active={isSelectedYear && month === selectedMonth}
                    key={`${month}_${item}`}
                    month={month + 1}
                    year={year}
                  />
                );
              })}
            </div>
          </div>
        );
      },
      [date, formatYear, isMonthDisabled, merge, prefix, rowCount, startYear]
    );

    const classes = merge(className, withClassPrefix(), { show });
    const itemSize = 75;
    const initialItemIndex = getYear(date) - startYear;
    const initialScrollOffset = itemSize * initialItemIndex;

    return (
      <Component
        role="grid"
        aria-label="Select month"
        tabIndex={-1}
        id={targetId ? `${targetId}-${classPrefix}` : undefined}
        {...rest}
        ref={ref}
        className={classes}
      >
        <div className={prefix('content')}>
          <div className={prefix('scroll')}>
            {show && (
              <AutoSizer defaultHeight={defaultHeight} defaultWidth={defaultWidth}>
                {({ height, width }) => (
                  <FixedSizeList
                    className={prefix('row-wrapper')}
                    width={width || defaultWidth}
                    height={height || defaultHeight}
                    itemSize={itemSize}
                    itemCount={rowCount}
                    initialScrollOffset={initialScrollOffset}
                  >
                    {rowRenderer}
                  </FixedSizeList>
                )}
              </AutoSizer>
            )}
          </div>
        </div>
      </Component>
    );
  }
);

MonthDropdown.displayName = 'MonthDropdown';

export default MonthDropdown;
