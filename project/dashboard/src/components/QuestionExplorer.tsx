import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import html2canvas from 'html2canvas';
import { ImageDown, Layers, Shuffle, Sparkles } from 'lucide-react';
import { useSurveyStore } from '../store/surveyStore';
import { CORPORATE_PALETTE, shufflePalette } from '../utils/colorPalette';
import {
  QuestionDefinition,
  questionCatalog,
  getDefaultQuestionId,
} from '../utils/questionCatalog';
import { SurveyResponse } from '../types/survey';

const chartTypes = {
  single: [
    { value: 'bar', label: 'Vertical Bar' },
    { value: 'horizontalBar', label: 'Horizontal Bar' },
    { value: 'pie', label: 'Pie / Donut' },
  ],
  multi: [
    { value: 'bar', label: 'Vertical Bar' },
    { value: 'horizontalBar', label: 'Horizontal Bar' },
    { value: 'pie', label: 'Pie / Donut' },
  ],
  matrix: [
    { value: 'stacked100', label: '100% Stacked Bar (Vertical)' },
    { value: 'stacked100Horizontal', label: '100% Stacked Bar (Horizontal)' },
    { value: 'bar', label: 'Standard Bar' },
  ],
  scale: [
    { value: 'line', label: 'Line Trend' },
    { value: 'bar', label: 'Vertical Bar' },
  ],
} as const;

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const parseMultiSelect = (value: unknown): number[] => {
  if (Array.isArray(value)) {
    return value.map((v) => Number(v)).filter((v) => !Number.isNaN(v));
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((v) => Number(v.trim()))
      .filter((v) => !Number.isNaN(v));
  }
  if (typeof value === 'number') {
    return [value];
  }
  return [];
};

interface SingleDataPoint {
  option: string;
  count: number;
  percent: number;
}

interface MatrixDataPoint {
  question: string;
  total: number;
  [key: string]: string | number;
}

interface ScaleDataPoint {
  bucket: string;
  count: number;
  percent: number;
}

const SingleTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value, payload: row } = payload[0];
  return (
    <div className="bg-white p-3 rounded-lg shadow-md border border-gray-100">
      <p className="font-semibold text-gray-800">{name}</p>
      <p className="text-sm text-gray-600">Count: {value}</p>
      <p className="text-sm text-gray-600">Share: {formatPercent(row.percent)}</p>
    </div>
  );
};

const MatrixTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const total = payload[0]?.payload?.total || 0;
  return (
    <div className="bg-white p-3 rounded-lg shadow-md border border-gray-100 max-w-xs">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      <div className="space-y-1 text-sm text-gray-700">
        {payload.map((entry: any) => {
          const count = entry.payload?.[`${entry.name}_count`] ?? 0;
          return (
            <div key={entry.name} className="flex justify-between gap-6">
              <span>{entry.name}</span>
              <span className="text-right">
                {count} ({formatPercent(entry.value)})
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 mt-2">Base n = {total}</p>
    </div>
  );
};

const ScaleTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { bucket, count, percent } = payload[0].payload as ScaleDataPoint;
  return (
    <div className="bg-white p-3 rounded-lg shadow-md border border-gray-100">
      <p className="font-semibold text-gray-800">{bucket}</p>
      <p className="text-sm text-gray-600">Count: {count}</p>
      <p className="text-sm text-gray-600">Share: {formatPercent(percent)}</p>
    </div>
  );
};

const buildSingleData = (
  definition: QuestionDefinition,
  rows: SurveyResponse[],
  baseCount: number,
): SingleDataPoint[] => {
  if (definition.shape === 'single') {
    return definition.options.map((opt) => {
      const count = rows.filter((r) => (r as any)[definition.field] === opt.value).length;
      return {
        option: opt.label,
        count,
        percent: baseCount ? (count / baseCount) * 100 : 0,
      };
    });
  }

  if (definition.shape === 'multi') {
    return definition.options.map((opt) => {
      const count = rows.filter((r) => parseMultiSelect((r as any)[definition.field]).includes(opt.value)).length;
      return {
        option: opt.label,
        count,
        percent: baseCount ? (count / baseCount) * 100 : 0,
      };
    });
  }

  return [];
};

const buildMatrixData = (definition: QuestionDefinition, rows: SurveyResponse[]): MatrixDataPoint[] => {
  if (definition.shape !== 'matrix') return [];

  return definition.subQuestions.map((sub) => {
    const validRows = rows.filter((r) => (r as any)[sub.field] !== undefined && (r as any)[sub.field] !== null);
    const total = validRows.length || 1;
    const entry: MatrixDataPoint = { question: sub.label, total };

    definition.options.forEach((opt, index) => {
      const range = definition.rangeOptions?.[index]?.range;
      const count = validRows.filter((r) => {
        const value = Number((r as any)[sub.field]);
        if (Number.isNaN(value)) return false;
        if (range) {
          return value >= range[0] && value <= range[1];
        }
        return value === opt.value;
      }).length;

      entry[opt.label] = total ? (count / total) * 100 : 0;
      entry[`${opt.label}_count`] = count;
    });

    return entry;
  });
};

const buildScaleData = (definition: QuestionDefinition, rows: SurveyResponse[], baseCount: number): ScaleDataPoint[] => {
  if (definition.shape !== 'scale') return [];

  return definition.buckets.map((bucket) => {
    const count = rows.filter((r) => {
      const value = Number((r as any)[definition.field]);
      if (Number.isNaN(value)) return false;
      return value >= bucket.range[0] && value <= bucket.range[1];
    }).length;

    return {
      bucket: bucket.label,
      count,
      percent: baseCount ? (count / baseCount) * 100 : 0,
    };
  });
};

export const QuestionExplorer = () => {
  const { filteredData } = useSurveyStore();
  const [selectedQuestionId, setSelectedQuestionId] = useState(getDefaultQuestionId());
  const [chartType, setChartType] = useState<string>('bar');
  const [questionColors, setQuestionColors] = useState<Record<string, Record<string, string>>>(() => ({
    [getDefaultQuestionId()]: {},
  }));
  const chartRef = useRef<HTMLDivElement>(null);

  const definition = useMemo<QuestionDefinition>(() => {
    return questionCatalog.find((q) => q.id === selectedQuestionId) || questionCatalog[0];
  }, [selectedQuestionId]);

  const baseCount = filteredData.length;

  const singleData = useMemo(() => buildSingleData(definition, filteredData, baseCount), [definition, filteredData, baseCount]);
  const matrixData = useMemo(() => buildMatrixData(definition, filteredData), [definition, filteredData]);
  const scaleData = useMemo(() => buildScaleData(definition, filteredData, baseCount), [definition, filteredData, baseCount]);

  const colorTargets = useMemo(() => {
    if (definition.shape === 'single' || definition.shape === 'multi') {
      return definition.options.map((opt) => opt.label);
    }
    if (definition.shape === 'matrix') {
      return definition.options.map((opt) => opt.label);
    }
    if (definition.shape === 'scale') {
      return ['Trend line', 'Bar fill'];
    }
    return [] as string[];
  }, [definition]);

  useEffect(() => {
    setQuestionColors((prev) => {
      const existing = prev[selectedQuestionId] || {};
      const updated: Record<string, string> = {};
      colorTargets.forEach((label, idx) => {
        updated[label] = existing[label] || CORPORATE_PALETTE[idx % CORPORATE_PALETTE.length];
      });
      return {
        ...prev,
        [selectedQuestionId]: updated,
      };
    });
  }, [colorTargets, selectedQuestionId]);

  useEffect(() => {
    const options = chartTypes[definition.shape];
    if (!options.some((opt) => opt.value === chartType)) {
      setChartType(options[0].value);
    }
  }, [definition, chartType]);

  const getColor = (label: string, index: number) => {
    return questionColors[selectedQuestionId]?.[label] || CORPORATE_PALETTE[index % CORPORATE_PALETTE.length];
  };

  const handleShuffleColors = () => {
    const shuffled = shufflePalette(CORPORATE_PALETTE);
    setQuestionColors((prev) => {
      const updated: Record<string, string> = {};
      colorTargets.forEach((label, idx) => {
        updated[label] = shuffled[idx % shuffled.length];
      });
      return {
        ...prev,
        [selectedQuestionId]: updated,
      };
    });
  };

  const handleExportImage = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current, {
      backgroundColor: '#ffffff',
      scale: 3,
      useCORS: true,
    });
    const link = document.createElement('a');
    link.download = `${selectedQuestionId}-${chartType}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  const renderSingleChart = () => {
    const isHorizontal = chartType === 'horizontalBar';

    if (chartType === 'pie') {
      const totalValue = singleData.reduce((sum, d) => sum + d.count, 0) || 1;
      return (
        <ResponsiveContainer width="100%" height={420}>
          <PieChart>
            <Pie
              data={singleData}
              dataKey="count"
              nameKey="option"
              innerRadius={80}
              outerRadius={140}
              label={(entry) => `${entry.option} (${formatPercent((entry.count / totalValue) * 100)})`}
            >
              {singleData.map((dataPoint, idx) => (
                <Cell key={idx} fill={getColor(dataPoint.option, idx)} />
              ))}
            </Pie>
            <Tooltip content={<SingleTooltip />} />
            <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 16 }} />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={420}>
        <BarChart data={singleData} layout={isHorizontal ? 'vertical' : 'horizontal'} margin={{ top: 20, right: 30, left: 20, bottom: 56 }}>
          <CartesianGrid strokeDasharray="3 3" />
          {isHorizontal ? (
            <>
              <XAxis type="number" label={{ value: 'Respondent count', position: 'insideBottom', offset: -5 }} />
              <YAxis dataKey="option" type="category" width={200} />
            </>
          ) : (
            <>
              <XAxis dataKey="option" interval={0} tick={{ fontSize: 12 }} label={{ value: 'Response options', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Respondent count', angle: -90, position: 'insideLeft' }} />
            </>
          )}
          <Tooltip content={<SingleTooltip />} />
          <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 16 }} />
          <Bar dataKey="count" name="Count" fill={getColor(singleData[0]?.option || 'Count', 0)} radius={[6, 6, 0, 0]}>
            {singleData.map((dataPoint, idx) => (
              <Cell key={idx} fill={getColor(dataPoint.option, idx)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderMatrixChart = () => {
    const isHorizontal = chartType === 'stacked100Horizontal';
    const showPercentAxisLabel = 'Share of respondents (%)';
    const stackId = chartType === 'bar' ? undefined : 'total';
    return (
      <ResponsiveContainer width="100%" height={520}>
        <BarChart
          data={matrixData}
          layout={isHorizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 20, right: 30, left: isHorizontal ? 200 : 20, bottom: 56 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          {isHorizontal ? (
            <>
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} label={{ value: showPercentAxisLabel, position: 'insideBottom', offset: -5 }} />
              <YAxis dataKey="question" type="category" width={220} />
            </>
          ) : (
            <>
              <XAxis dataKey="question" interval={0} tick={{ fontSize: 11 }} label={{ value: 'Question statement', position: 'insideBottom', offset: -5 }} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} label={{ value: showPercentAxisLabel, angle: -90, position: 'insideLeft' }} />
            </>
          )}
          <Tooltip content={<MatrixTooltip />} />
          <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 16 }} />
          {definition.shape === 'matrix' &&
            definition.options.map((opt, idx) => (
              <Bar key={opt.value} dataKey={opt.label} stackId={stackId} name={opt.label} fill={getColor(opt.label, idx)} />
            ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderScaleChart = () => (
    <ResponsiveContainer width="100%" height={420}>
      <LineChart data={scaleData} margin={{ top: 20, right: 30, left: 20, bottom: 56 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="bucket" interval={0} tick={{ fontSize: 12 }} label={{ value: 'Score bucket', position: 'insideBottom', offset: -5 }} />
        <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} label={{ value: 'Share of respondents (%)', angle: -90, position: 'insideLeft' }} />
        <Tooltip content={<ScaleTooltip />} />
        <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 16 }} />
        <Line
          type="monotone"
          dataKey="percent"
          name="Percent of respondents"
          stroke={getColor('Trend line', 0)}
          strokeWidth={3}
          dot={{ r: 4, strokeWidth: 2 }}
        />
        <Bar dataKey="percent" fill={getColor('Bar fill', 1)} opacity={0.2} />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderChart = () => {
    if (definition.shape === 'matrix') return renderMatrixChart();
    if (definition.shape === 'scale') return renderScaleChart();
    return renderSingleChart();
  };

  const availableChartTypes = chartTypes[definition.shape];

  return (
    <section className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500 font-semibold">All Survey Questions</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">Question-by-question visualizations</h2>
          <p className="text-gray-600 text-sm mt-1 max-w-3xl">
            Use the drop-down menu to browse every question from the survey. Switch chart types to see the data as vertical or
            horizontal bars, 100% stacked bars, or pie charts. The palette uses the Little Tikes study colors, and you can
            randomize or export each visualization as a high-resolution image.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleShuffleColors}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:border-blue-500 hover:text-blue-700"
            type="button"
          >
            <Shuffle size={18} />
            Randomize colors
          </button>
          <button
            onClick={handleExportImage}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white shadow-md hover:bg-blue-700"
            type="button"
          >
            <ImageDown size={18} />
            Export to image
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="md:col-span-2">
          <span className="text-sm font-semibold text-gray-700">Choose a survey question</span>
          <select
            value={selectedQuestionId}
            onChange={(e) => setSelectedQuestionId(e.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {questionCatalog.map((question) => (
              <option key={question.id} value={question.id}>
                {question.category} — {question.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="text-sm font-semibold text-gray-700">Chart type</span>
          <div className="flex items-center gap-2 mt-2">
            <Layers size={16} className="text-gray-500" />
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableChartTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </label>
      </div>

      <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <Sparkles size={16} className="text-amber-500" />
          <span>Customize series colors</span>
        </div>
        <p className="text-sm text-gray-600">Assign distinct colors to each answer choice or series for the selected question.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {colorTargets.map((label, idx) => (
            <label key={label} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-2">
              <input
                type="color"
                value={getColor(label, idx)}
                onChange={(e) =>
                  setQuestionColors((prev) => ({
                    ...prev,
                    [selectedQuestionId]: {
                      ...(prev[selectedQuestionId] || {}),
                      [label]: e.target.value,
                    },
                  }))
                }
                className="h-9 w-14 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-800">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">N</div>
          <div>
            <p className="text-sm text-gray-600">Filtered respondents</p>
            <p className="font-semibold text-gray-900 text-lg">{baseCount}</p>
          </div>
        </div>
        <div className="flex-1 text-sm text-gray-700 leading-relaxed flex items-start gap-2">
          <Sparkles size={18} className="text-amber-500 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-900">{definition.label}</p>
            <p>{definition.prompt}</p>
          </div>
        </div>
      </div>

      {definition.visualizations?.length ? (
        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm font-semibold text-blue-900">Suggested visualizations for this question</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {definition.visualizations.map((viz) => (
              <span key={viz} className="px-3 py-1 bg-white border border-blue-200 text-blue-800 rounded-full text-xs font-semibold">
                {viz}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div ref={chartRef} className="mt-6 bg-white rounded-xl border border-gray-100 p-4">
        {renderChart()}
      </div>
    </section>
  );
};
