import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface MonthYearPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  startDate?: string; // For end date validation
  disabled?: boolean; // To disable the picker
}

const MonthYearPicker: React.FC<MonthYearPickerProps> = ({ value, onChange, placeholder, label, startDate, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'year' | 'month' | 'calendar'>('month');
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.month-year-picker')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const years = Array.from({ length: new Date().getFullYear() - 1950 + 6 }, (_, i) => 1950 + i);

  // Helper function to parse date strings
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    
    const parts = dateString.split('-');
    if (parts.length === 1) {
      // Year only (YYYY)
      return new Date(parseInt(parts[0]), 0, 1);
    } else if (parts.length === 2) {
      // Year and month (YYYY-MM)
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
    } else if (parts.length === 3) {
      // Full date (YYYY-MM-DD)
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    return null;
  };

  // Validation function for start dates
  const isValidStartDate = (selectedDate: Date): boolean => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    // Start date must be <= today
    if (selectedDate > today) {
      return false;
    }
    
    // Start date must be <= min(today, end date)
    if (startDate && label.toLowerCase().includes('start')) {
      // This is a start date field, so we need to check against existing end date
      const endDateObj = parseDate(startDate); // startDate parameter contains end date for start date validation
      if (endDateObj && selectedDate > endDateObj) {
        return false;
      }
    }
    
    return true;
  };

  // Validation function for end dates
  const isValidEndDate = (selectedDate: Date): boolean => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    // End date must be <= today
    if (selectedDate > today) {
      return false;
    }
    
    // End date must be >= start date
    if (startDate) {
      const startDateObj = parseDate(startDate);
      if (startDateObj && selectedDate < startDateObj) {
        return false;
      }
    }
    
    return true;
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(monthIndex);
    setSelectedMonth(monthIndex); // Track the selected month
    setViewMode('calendar'); // Automatically move to calendar view
  };

  const handleDateSelect = (day: number) => {
    const year = currentYear;
    const month = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const selectedDate = new Date(year, currentMonth, day);
    
    // Check if this is a start date field (label contains "Start")
    const isStartDate = label.toLowerCase().includes('start');
    
    if (isStartDate) {
      // Start date validation: must be <= min(today, end date)
      if (!isValidStartDate(selectedDate)) {
        return;
      }
    } else {
      // End date validation: must be >= start date and <= today
      if (!isValidEndDate(selectedDate)) {
        return;
      }
    }
    
    onChange(`${year}-${month}-${dayStr}`);
    setIsOpen(false);
    setViewMode('month');
  };

  const handleYearSelect = (year: number) => {
    setCurrentYear(year);
    setShowYearDropdown(false);
    setViewMode('month'); // Automatically move to month selection
  };

  const formatDisplayValue = (dateString: string) => {
    if (!dateString) return placeholder;
    
    const parts = dateString.split('-');
    
    if (parts.length === 1) {
      // Only year selected (YYYY)
      return parts[0];
    } else if (parts.length === 2) {
      // Year and month selected (YYYY-MM)
      const [year, month] = parts;
      const monthIndex = parseInt(month) - 1;
      return `${months[monthIndex]} ${year}`;
    } else if (parts.length === 3) {
      // Year, month, and date selected (YYYY-MM-DD)
      const [year, month, day] = parts;
      const monthIndex = parseInt(month) - 1;
      return `${day} ${months[monthIndex]} ${year}`;
    }
    
    return dateString;
  };

  // Format header display based on current selection state
  const formatHeaderDisplay = () => {
    // When actively selecting (picker is open), prioritize current selection over saved value
    if (isOpen && selectedMonth !== null) {
      // If picker is open and month is selected, show selected month + year
      return `${months[selectedMonth]} ${currentYear}`;
    } else if (value) {
      // If there's a saved value and not actively selecting, show it
      return formatDisplayValue(value);
    } else if (selectedMonth !== null) {
      // If a month is selected but picker is closed, show selected month + year
      return `${months[selectedMonth]} ${currentYear}`;
    } else if (viewMode === 'month') {
      // In month view with no selection, show just the year
      return `${currentYear}`;
    } else {
      // Default: show just the year
      return `${currentYear}`;
    }
  };

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
      days.push({
        date: currentDate.getDate(),
        isCurrentMonth: currentDate.getMonth() === currentMonth,
        isToday: currentDate.toDateString() === new Date().toDateString()
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  return (
    <div className="relative month-year-picker">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-2.5 rounded-lg border text-left flex items-center justify-between transition-colors text-sm ${
          disabled
            ? 'bg-obsidian-surface border-obsidian-border text-ink-muted cursor-not-allowed opacity-50'
            : 'bg-obsidian-surface border-obsidian-border text-ink-primary hover:border-accent-indigo/40 focus:outline-none focus:border-accent-indigo/50'
        }`}
      >
        <span className={value ? 'text-ink-primary' : 'text-ink-muted'}>
          {formatDisplayValue(value)}
        </span>
        <Calendar className="w-4 h-4 text-ink-muted" />
      </button>

      {/* Date Picker Dropdown */}
      {isOpen && (
        <>
          {/* Overlay to close picker when clicking outside */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          
          <div className="absolute top-full left-0 mt-2 w-72 bg-obsidian-card border border-obsidian-border rounded-xl shadow-2xl z-20">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-obsidian-border">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-ink-primary">{formatHeaderDisplay()}</span>
                <button
                  type="button"
                  onClick={() => { if (showYearDropdown) setShowYearDropdown(false); else { setShowYearDropdown(true); setViewMode('month'); } }}
                  className="p-1 hover:bg-obsidian-border rounded transition-colors"
                  title="Select year"
                >
                  <ChevronDown className={`w-3.5 h-3.5 text-ink-muted transition-transform duration-200 ${showYearDropdown ? 'rotate-180' : ''}`} />
                </button>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => {
                    if (showYearDropdown) { setCurrentYear(prev => prev - 1); }
                    else { setCurrentMonth(prev => prev === 0 ? 11 : prev - 1); if (currentMonth === 0) setCurrentYear(prev => prev - 1); }
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${showYearDropdown ? 'bg-accent-indigo/20 text-accent-indigo' : 'hover:bg-obsidian-border text-ink-muted'}`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (showYearDropdown) { setCurrentYear(prev => prev + 1); }
                    else { setCurrentMonth(prev => prev === 11 ? 0 : prev + 1); if (currentMonth === 11) setCurrentYear(prev => prev + 1); }
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${showYearDropdown ? 'bg-accent-indigo/20 text-accent-indigo' : 'hover:bg-obsidian-border text-ink-muted'}`}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Year Dropdown */}
            {showYearDropdown && (
              <>
                <div className="fixed inset-0 z-25" onClick={() => setShowYearDropdown(false)} />
                <div className="relative z-30">
                  <div className="p-3 border-b border-obsidian-border">
                    <div className="grid grid-cols-3 gap-1.5 max-h-44 overflow-y-auto scrollbar-thin">
                      {years.map((year) => {
                        const isStartDate = label.toLowerCase().includes('start');
                        const isInvalidYear = isStartDate ? !isValidStartDate(new Date(year, 0, 1)) : !isValidEndDate(new Date(year, 0, 1));
                        return (
                          <button
                            key={year}
                            type="button"
                            onClick={() => !isInvalidYear && handleYearSelect(year)}
                            disabled={isInvalidYear}
                            className={`w-full px-2 py-1.5 text-xs rounded-md transition-colors flex items-center justify-center ${
                              year === currentYear
                                ? 'bg-accent-indigo text-white font-medium'
                                : isInvalidYear
                                  ? 'text-ink-muted cursor-not-allowed opacity-40'
                                  : 'text-ink-secondary hover:bg-accent-indigo/10 hover:text-accent-indigo'
                            }`}
                          >
                            {year}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button type="button" onClick={() => setShowYearDropdown(false)} className="flex-1 px-3 py-1.5 text-xs btn-ghost rounded-md">Cancel</button>
                      <button type="button" onClick={() => { onChange(`${currentYear}`); setIsOpen(false); setShowYearDropdown(false); }} className="flex-1 px-3 py-1.5 text-xs btn-glow rounded-md">Save</button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Month View */}
            {viewMode === 'month' && !showYearDropdown && (
              <div className="p-3">
                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  {months.map((month, index) => {
                    const isStartDate = label.toLowerCase().includes('start');
                    const isInvalidMonth = isStartDate ? !isValidStartDate(new Date(currentYear, index, 1)) : !isValidEndDate(new Date(currentYear, index, 1));
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => !isInvalidMonth && handleMonthSelect(index)}
                        disabled={isInvalidMonth}
                        className={`px-2 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center ${
                          isInvalidMonth
                            ? 'text-ink-muted cursor-not-allowed opacity-40'
                            : 'text-ink-secondary hover:bg-accent-indigo/10 hover:text-accent-indigo'
                        }`}
                      >
                        {month}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsOpen(false)} className="flex-1 px-3 py-1.5 text-xs btn-ghost rounded-md">Cancel</button>
                  <button
                    type="button"
                    onClick={() => {
                      const monthToSave = selectedMonth !== null ? String(selectedMonth + 1).padStart(2, '0') : '';
                      onChange(monthToSave ? `${currentYear}-${monthToSave}` : `${currentYear}`);
                      setIsOpen(false);
                    }}
                    className="flex-1 px-3 py-1.5 text-xs btn-glow rounded-md"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* Calendar View */}
            {viewMode === 'calendar' && !showYearDropdown && (
              <div className="p-3">
                <div className="grid grid-cols-7 gap-0.5">
                  {generateCalendarDays().map((day, index) => {
                    const isStartDate = label.toLowerCase().includes('start');
                    const isInvalidDate = isStartDate ? !isValidStartDate(new Date(currentYear, currentMonth, day.date)) : !isValidEndDate(new Date(currentYear, currentMonth, day.date));
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => day.isCurrentMonth && !isInvalidDate && handleDateSelect(day.date)}
                        disabled={!day.isCurrentMonth || isInvalidDate}
                        className={`w-8 h-7 text-xs rounded transition-colors flex items-center justify-center ${
                          !day.isCurrentMonth || isInvalidDate
                            ? 'text-ink-muted/30 cursor-not-allowed'
                            : day.isToday
                              ? 'bg-accent-indigo/20 text-accent-indigo font-medium'
                              : 'text-ink-secondary hover:bg-accent-indigo/10 hover:text-accent-indigo'
                        }`}
                      >
                        {day.date}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 mt-3">
                  <button type="button" onClick={() => setIsOpen(false)} className="flex-1 px-3 py-1.5 text-xs btn-ghost rounded-md">Cancel</button>
                  <button
                    type="button"
                    onClick={() => { onChange(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`); setIsOpen(false); }}
                    className="flex-1 px-3 py-1.5 text-xs btn-glow rounded-md"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MonthYearPicker;
