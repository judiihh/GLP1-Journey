"use client";

import { useApp } from "@/hooks/useAppData";
import { PageHeader } from "@/components/layout/Navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { analyzePatterns, formatDate } from "@/lib/utils";
import {
  Sparkles,
  AlertTriangle,
  Info,
  TrendingUp,
  Lightbulb,
} from "lucide-react";

const severityStyles = {
  positive: {
    bg: "bg-turquoise-50 border-turquoise-200",
    icon: TrendingUp,
    iconColor: "text-turquoise-500",
  },
  watch: {
    bg: "bg-rose-50 border-rose-200",
    icon: AlertTriangle,
    iconColor: "text-rose-500",
  },
  info: {
    bg: "bg-lavender-50 border-lavender-200",
    icon: Info,
    iconColor: "text-lavender-500",
  },
};

export default function InsightsPage() {
  const { data } = useApp();
  const insights = analyzePatterns(data);

  return (
    <div>
      <PageHeader
        title="Insights"
        subtitle="Patterns across your symptoms, dosage, nutrition, and progress"
      />

      {insights.length === 0 ? (
        <Card className="text-center py-16">
          <Sparkles className="w-12 h-12 mx-auto text-lavender-300 mb-4" />
          <h3 className="font-display text-lg font-semibold text-gray-800 mb-2">
            Keep logging — insights are on their way
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            As you log injections, nutrition, symptoms, and weight, we&apos;ll
            identify helpful patterns and connections for you and your doctor.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => {
            const style = severityStyles[insight.severity];
            const Icon = style.icon;
            return (
              <Card
                key={insight.id}
                className={`border ${style.bg}`}
              >
                <div className="flex gap-4">
                  <div className={`mt-0.5 ${style.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-semibold text-gray-800">
                        {insight.title}
                      </h3>
                      <span className="text-[10px] uppercase tracking-wide text-gray-400 bg-white/60 px-2 py-0.5 rounded-full">
                        {insight.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {insight.description}
                    </p>
                    {insight.relatedDates.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {insight.relatedDates.map((d) => (
                          <span
                            key={d}
                            className="text-[10px] bg-white/70 text-gray-500 px-2 py-0.5 rounded-full"
                          >
                            {formatDate(d, "MMM d")}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* How insights work */}
      <Card className="mt-8">
        <CardHeader
          title="How insights work"
          subtitle="We look for meaningful connections in your data"
        />
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {[
            {
              title: "Dosage & symptoms",
              desc: "Side effects within 7 days of a dosage increase",
            },
            {
              title: "Injection timing",
              desc: "Symptoms appearing on or after injection days",
            },
            {
              title: "Nutrition & energy",
              desc: "Low protein days correlated with fatigue",
            },
            {
              title: "Progress trends",
              desc: "Weight and consistency milestones",
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-3 p-3 rounded-xl bg-lavender-50/50">
              <Lightbulb className="w-4 h-4 text-lavender-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-700">{item.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
