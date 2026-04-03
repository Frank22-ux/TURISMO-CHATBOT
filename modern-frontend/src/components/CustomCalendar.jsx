import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CustomCalendar = ({ selectedDate, onSelect, availableDays = [0, 1, 2, 3, 4, 5, 6] }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  
  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = (firstDayOfMonth(year, month) + 6) % 7; // Adjust for Monday start
    
    const prevMonthTotalDays = daysInMonth(year, month - 1);
    const prevMonthDays = Array.from({ length: startDay }, (_, i) => ({
      day: prevMonthTotalDays - startDay + i + 1,
      month: month - 1,
      current: false
    }));
    
    const currentMonthDays = Array.from({ length: totalDays }, (_, i) => {
      const d = new Date(year, month, i + 1);
      return {
        day: i + 1,
        month: month,
        current: true,
        dayOfWeek: d.getDay() // 0=Sun, 1=Mon...
      };
    });
    
    return [...prevMonthDays, ...currentMonthDays];
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const isSelected = (day, month) => {
    if (!selectedDate) return false;
    // Normalize selectedDate to local timezone YYYY-MM-DD to avoid timezone bugs
    const dateParts = selectedDate.split('-');
    if (dateParts.length !== 3) return false;
    const y = parseInt(dateParts[0]);
    const m = parseInt(dateParts[1]) - 1;
    const d = parseInt(dateParts[2]);
    
    return d === day && m === month && y === currentMonth.getFullYear();
  };

  const isPast = (day, month) => {
    const d = new Date(currentMonth.getFullYear(), month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xl overflow-hidden w-80 mx-auto">
      <div className="flex justify-between items-center mb-5">
        <h4 className="font-display font-black text-slate-800 text-base">
          {monthNames[currentMonth.getMonth()]} <small className="font-normal opacity-40">{currentMonth.getFullYear()}</small>
        </h4>
        <div className="flex gap-1.5">
          <button onClick={handlePrevMonth} type="button" className="p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          </button>
          <button onClick={handleNextMonth} type="button" className="p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(d => (
          <div key={d} className="text-[11px] font-black text-slate-400 text-center uppercase py-1.5">{d}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((item, idx) => {
          const past = isPast(item.day, item.month);
          const active = isSelected(item.day, item.month);
          const isAvailable = item.current && availableDays.includes(item.dayOfWeek);
          
          return (
            <button
              key={idx}
              type="button"
              disabled={past || !item.current || !isAvailable}
              onClick={() => {
                 const y = currentMonth.getFullYear();
                 const m = String(item.month + 1).padStart(2, '0');
                 const d = String(item.day).padStart(2, '0');
                 onSelect(`${y}-${m}-${d}`);
              }}
              className={`
                aspect-square w-full rounded-xl flex items-center justify-center text-sm font-bold transition-all
                ${!item.current ? 'text-slate-200' : past ? 'text-slate-300 cursor-not-allowed text-xs' : !isAvailable ? 'text-slate-200 cursor-not-allowed opacity-50' : 'text-slate-700 hover:bg-primary-dark/5'}
                ${active ? 'bg-primary text-white shadow-lg shadow-primary/25 transform scale-105 !text-white' : ''}
              `}
            >
              {item.day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CustomCalendar;
