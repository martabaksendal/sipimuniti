import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Users, ExternalLink, CheckCircle2 } from 'lucide-react';

export const CompetitionCalendar = ({
  contests,
  registeredIds,
  onRegister,
  onEnterLive
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 19)); // August 2026
  const [selectedDay, setSelectedDay] = useState(19); // 19th August

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Day of week for 1st of month (0 = Sun)
  const startDayOfWeek = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  // Map contests to day numbers in current month
  const getContestsForDay = (dayNum) => {
    return contests.filter(c => {
      const contestDate = new Date(c.startTime);
      return (
        contestDate.getFullYear() === year &&
        contestDate.getMonth() === month &&
        contestDate.getDate() === dayNum
      );
    });
  };

  const generateGoogleCalendarUrl = (contest) => {
    const title = encodeURIComponent(contest.title);
    const details = encodeURIComponent(contest.description);
    const start = new Date(contest.startTime).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const end = new Date(new Date(contest.startTime).getTime() + contest.durationMinutes * 60000)
      .toISOString().replace(/-|:|\.\d\d\d/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${start}/${end}`;
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 space-y-6">
      
      {/* Calendar Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-400" />
          <h3 className="font-heading font-extrabold text-white text-lg">
            {monthNames[month]} {year}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setCurrentDate(new Date(2026, 7, 19));
              setSelectedDay(19);
            }}
            className="px-3 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold hover:bg-indigo-600 hover:text-white transition-all"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-bold text-slate-400 border-b border-slate-800/80 pb-2">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty offset cells */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-20 rounded-xl bg-slate-950/20 border border-transparent" />
        ))}

        {/* Month Day Cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dayContests = getContestsForDay(dayNum);
          const isToday = year === 2026 && month === 7 && dayNum === 19;
          const isSelected = selectedDay === dayNum;
          const hasContests = dayContests.length > 0;

          return (
            <div
              key={dayNum}
              onClick={() => setSelectedDay(dayNum)}
              className={`h-20 p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                isSelected
                  ? 'bg-indigo-950/60 border-indigo-500 shadow-lg glow-blue'
                  : isToday
                  ? 'bg-slate-900 border-indigo-500/50'
                  : hasContests
                  ? 'bg-slate-900/90 border-slate-700 hover:border-indigo-500/40'
                  : 'bg-slate-950/60 border-slate-800/60 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono font-bold ${isToday ? 'text-indigo-400' : 'text-slate-300'}`}>
                  {dayNum}
                </span>
                {isToday && (
                  <span className="text-[9px] px-1 rounded bg-indigo-500/30 text-indigo-300 font-mono font-bold">
                    TODAY
                  </span>
                )}
              </div>

              {/* Event Pills inside Day Cell */}
              <div className="space-y-1 overflow-hidden">
                {dayContests.map(c => (
                  <div
                    key={c.id}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold truncate flex items-center gap-1 ${
                      c.status === 'LIVE'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                        : c.status === 'UPCOMING'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <span>{c.status === 'LIVE' ? '● LIVE' : c.status}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Contests Details Panel */}
      {selectedDay && (
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            Events Scheduled for {monthNames[month]} {selectedDay}, {year}:
          </h4>

          {getContestsForDay(selectedDay).length === 0 ? (
            <p className="text-xs text-slate-500 font-mono italic">No official competitive rounds scheduled on this date.</p>
          ) : (
            <div className="space-y-3">
              {getContestsForDay(selectedDay).map(c => {
                const isRegistered = registeredIds.includes(c.id);
                return (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          c.status === 'LIVE' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {c.status}
                        </span>
                        <h5 className="font-heading font-bold text-white text-sm">{c.title}</h5>
                      </div>
                      <p className="text-xs text-slate-400">{c.description}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {c.status === 'UPCOMING' && (
                        <a
                          href={generateGoogleCalendarUrl(c)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                          title="Add to Google Calendar"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Google Cal</span>
                        </a>
                      )}

                      {c.status === 'LIVE' ? (
                        <button
                          onClick={onEnterLive}
                          className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow glow-purple"
                        >
                          Enter Competition
                        </button>
                      ) : isRegistered ? (
                        <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Registered</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => onRegister(c.id)}
                          className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                        >
                          Register
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
