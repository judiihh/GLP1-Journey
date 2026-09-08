"use client";

import { useMemo, useState } from "react";
import { subDays, format } from "date-fns";
import { useApp } from "@/hooks/useAppData";
import { PageHeader } from "@/components/layout/Navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { TrendChart } from "@/components/charts/Charts";
import { formatDate, todayISO, validateLogDate, sideEffectItems } from "@/lib/utils";
import { SEVERITY_LABELS } from "@/lib/constants";
import { SymptomLogForm } from "@/components/symptoms/SymptomLogForm";
import {
  InjectionSymptomItem,
  OtherSymptomDayItem,
} from "@/components/symptoms/InjectionSymptomItem";
import type { SideEffectLog } from "@/lib/types";
import { CalendarDays, Syringe } from "lucide-react";

export default function SymptomsPage() {
  const { data, logSideEffect } = useApp();
  const { sideEffects, injections } = data;
  const today = todayISO();

  const [showOtherDayForm, setShowOtherDayForm] = useState<string | null>(null);
  const [otherLogDate, setOtherLogDate] = useState(() =>
    format(subDays(new Date(), 1), "yyyy-MM-dd")
  );

  const todaySideEffect = sideEffects.find((s) => s.date === today);
  const otherDaySideEffect = sideEffects.find((s) => s.date === otherLogDate);
  const injectionDates = useMemo(
    () => new Set(injections.map((i) => i.date)),
    [injections]
  );

  const sortedInjections = useMemo(
    () =>
      [...injections].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [injections]
  );

  const otherSymptomDays = useMemo(
    () =>
      sideEffects.filter(
        (s) => !injectionDates.has(s.date) && s.date !== today
      ),
    [sideEffects, injectionDates, today]
  );

  const sideEffectByDate = useMemo(() => {
    const map = new Map<string, SideEffectLog>();
    for (const s of sideEffects) map.set(s.date, s);
    return map;
  }, [sideEffects]);

  const handleSave = async (log: SideEffectLog) => {
    await logSideEffect(log);
  };

  const nauseaData = sideEffects
    .slice(0, 14)
    .reverse()
    .map((s) => ({
      date: formatDate(s.date, "MMM d"),
      severity: sideEffectItems(s).find((e) => e.type === "nausea")?.severity ?? 0,
    }));

  const fatigueData = sideEffects
    .slice(0, 14)
    .reverse()
    .map((s) => ({
      date: formatDate(s.date, "MMM d"),
      severity: sideEffectItems(s).find((e) => e.type === "fatigue")?.severity ?? 0,
    }));

  const todayHasInjection = injectionDates.has(today);
  const otherLogDateIsToday = otherLogDate === today;
  const otherLogDateHasInjection = injectionDates.has(otherLogDate);
  const otherLogDateError = validateLogDate(otherLogDate);

  return (
    <div>
      <PageHeader
        title="Symptoms"
        subtitle="Log how you feel today, catch up on past days, or review symptoms around each injection"
      />

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="space-y-6">
          {/* Today — always available */}
          <Card>
            <CardHeader
              title="Today"
              subtitle={formatDate(today, "EEEE, MMM d")}
            />
            {todayHasInjection && (
              <p className="text-xs text-lavender-600 bg-lavender-50 border border-lavender-100 rounded-lg px-3 py-2.5 mb-4 flex items-start gap-2 leading-relaxed">
                <Syringe className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                Injection day — what you log here also shows in your injection history below.
              </p>
            )}
            <SymptomLogForm
              date={today}
              existing={todaySideEffect}
              onSave={handleSave}
              submitLabel={
                todaySideEffect ? "Update today's symptoms" : "Save today's symptoms"
              }
            />
          </Card>

          {/* Past or other days — date picker */}
          <Card>
            <CardHeader
              title="Another day"
              subtitle="Pick a date to log or update symptoms you missed"
            />
            <Input
              label="Date"
              type="date"
              value={otherLogDate}
              max={today}
              error={otherLogDateError ?? undefined}
              onChange={(e) => setOtherLogDate(e.target.value)}
            />
            {otherLogDateIsToday ? (
              <p className="text-sm text-gray-500 mt-4 leading-relaxed">
                For today, use the section above — it’s always ready for a quick log.
              </p>
            ) : otherLogDateError ? null : (
              <>
                {otherLogDateHasInjection && (
                  <p className="text-xs text-lavender-600 bg-lavender-50 border border-lavender-100 rounded-lg px-3 py-2.5 mt-4 flex items-start gap-2 leading-relaxed">
                    <Syringe className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    Injection day — what you log here also shows in your injection history below.
                  </p>
                )}
                <div className="mt-4">
                  <SymptomLogForm
                    key={otherLogDate}
                    date={otherLogDate}
                    existing={otherDaySideEffect}
                    onSave={handleSave}
                    submitLabel={
                      otherDaySideEffect
                        ? `Update symptoms for ${formatDate(otherLogDate, "MMM d")}`
                        : `Save symptoms for ${formatDate(otherLogDate, "MMM d")}`
                    }
                  />
                </div>
              </>
            )}
          </Card>

          {/* Injection-linked history */}
          <Card>
            <CardHeader
              title="Symptoms by injection"
              subtitle="Tap an injection day to log or edit how you felt"
            />
            {sortedInjections.length === 0 ? (
              <div className="text-center py-10 px-4">
                <Syringe className="w-10 h-10 text-lavender-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600">
                  Log an injection first — your symptom history will be organized by injection date.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedInjections.map((injection) => (
                  <InjectionSymptomItem
                    key={injection.id}
                    injection={injection}
                    sideEffect={sideEffectByDate.get(injection.date)}
                    onSave={handleSave}
                    defaultOpen={false}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* Other days (symptoms logged without injection on that day) */}
          {otherSymptomDays.length > 0 && (
            <Card>
              <CardHeader
                title="Other symptom days"
                subtitle="Days you logged symptoms without an injection"
              />
              <div className="space-y-3">
                {otherSymptomDays.map((entry) =>
                  showOtherDayForm === entry.date ? (
                    <Card key={entry.id} className="p-4 bg-lavender-50/30">
                      <p className="text-sm font-medium text-gray-800 mb-3">
                        {formatDate(entry.date, "EEEE, MMM d")}
                      </p>
                      <SymptomLogForm
                        date={entry.date}
                        existing={entry}
                        onSave={async (log) => {
                          await handleSave(log);
                          setShowOtherDayForm(null);
                        }}
                        submitLabel="Update symptoms"
                        compact
                      />
                    </Card>
                  ) : (
                    <OtherSymptomDayItem
                      key={entry.id}
                      entry={entry}
                      onEdit={() => setShowOtherDayForm(entry.date)}
                    />
                  )
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Charts + legend */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Severity guide" />
            <div className="grid grid-cols-2 gap-2 text-sm">
              {SEVERITY_LABELS.map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-medium ${
                      i === 0
                        ? "bg-sage-100 text-sage-600"
                        : i <= 2
                          ? "bg-lavender-100 text-lavender-600"
                          : "bg-rose-100 text-rose-600"
                    }`}
                  >
                    {i}
                  </span>
                  <span className="text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Nausea trend"
              subtitle="Last 14 entries"
            />
            {nauseaData.length > 0 ? (
              <TrendChart
                data={nauseaData}
                dataKey="severity"
                color="#ebb1cb"
                type="bar"
              />
            ) : (
              <p className="text-sm text-gray-500 py-6 text-center flex items-center justify-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Log symptoms to see trends
              </p>
            )}
          </Card>

          <Card>
            <CardHeader title="Fatigue trend" subtitle="Last 14 entries" />
            {fatigueData.length > 0 ? (
              <TrendChart
                data={fatigueData}
                dataKey="severity"
                color="#a892d4"
                type="bar"
              />
            ) : (
              <p className="text-sm text-gray-500 py-6 text-center">
                Log symptoms to see trends
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
