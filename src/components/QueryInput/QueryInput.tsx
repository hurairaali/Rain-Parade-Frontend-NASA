import { useState } from 'react';
import { Calendar, Settings, ArrowRight } from 'lucide-react';
import DateSelector from './DateSelector';
import WeatherConditions from './WeatherConditions';
import type { QueryInputProps, QueryParams, WeatherCondition, WeatherThreshold } from '../../types';

const QueryInput: React.FC<QueryInputProps> = ({ location, onSubmit }) => {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedConditions, setSelectedConditions] = useState<WeatherCondition[]>([]);
  const [tempUnit, setTempUnit] = useState<'°F' | '°C'>('°F');
  const [thresholds, setThresholds] = useState<WeatherThreshold[]>([
    { condition: 'hot', value: 90, unit: '°F', enabled: false },
    { condition: 'cold', value: 32, unit: '°F', enabled: false },
    { condition: 'windy', value: 20, unit: 'mph', enabled: false },
    { condition: 'wet', value: 0.5, unit: 'inches', enabled: false },
    { condition: 'uncomfortable', value: 80, unit: 'index', enabled: false },
  ]);

  const handleTempUnitChange = (unit: '°F' | '°C') => {
    setTempUnit(unit);
    setThresholds(prev => prev.map(t => {
      if (t.condition === 'hot') return { ...t, unit, value: unit === '°C' ? 32 : 90 };
      if (t.condition === 'cold') return { ...t, unit, value: unit === '°C' ? 0 : 32 };
      return t;
    }));
  };

  const handleConditionToggle = (condition: WeatherCondition) => {
    setSelectedConditions(prev => {
      if (prev.includes(condition)) {
        return prev.filter(c => c !== condition);
      } else {
        return [...prev, condition];
      }
    });

    // Also toggle the threshold
    setThresholds(prev => prev.map(t => 
      t.condition === condition ? { ...t, enabled: !t.enabled } : t
    ));
  };

  const handleThresholdChange = (condition: WeatherCondition, value: number) => {
    setThresholds(prev => prev.map(t => 
      t.condition === condition ? { ...t, value } : t
    ));
  };

  const handleSubmit = () => {
    const queryParams: QueryParams = {
      location,
      date,
      dayOfYear: getDayOfYear(date),
      conditions: selectedConditions,
      thresholds: thresholds.filter(t => t.enabled),
      timeRange: {
        start: 1980,
        end: new Date().getFullYear() - 2 // NASA POWER data typically lags by 2 years
      }
    };
    onSubmit(queryParams);
  };

  const getDayOfYear = (date: Date): number => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  const isValid = selectedConditions.length > 0;

  return (
    <div className="glass-card p-6 space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">Query Parameters</h3>
          <p className="text-gray-400 text-sm">
            Set your date and weather conditions
          </p>
        </div>
      </div>

      {/* Date Selection */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Calendar className="w-5 h-5 text-nasa-blue" />
          <h4 className="text-lg font-semibold text-white">Select Date</h4>
        </div>
        <DateSelector 
          value={date}
          onChange={setDate}
        />
      </div>

      {/* Temperature unit — choose what you understand */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-2">Show temperatures in</h4>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleTempUnitChange('°F')}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              tempUnit === '°F'
                ? 'bg-nasa-blue text-white border-nasa-blue'
                : 'bg-white/5 text-gray-400 border-white/20 hover:border-white/40'
            }`}
          >
            Fahrenheit (°F)
          </button>
          <button
            type="button"
            onClick={() => handleTempUnitChange('°C')}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              tempUnit === '°C'
                ? 'bg-nasa-blue text-white border-nasa-blue'
                : 'bg-white/5 text-gray-400 border-white/20 hover:border-white/40'
            }`}
          >
            Celsius (°C)
          </button>
        </div>
        <p className="text-gray-500 text-xs mt-1">All results will use this unit. Choose what you’re used to.</p>
      </div>

      {/* Weather Conditions */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-3">Weather Conditions to Analyze</h4>
        <WeatherConditions
          selectedConditions={selectedConditions}
          thresholds={thresholds}
          onConditionToggle={handleConditionToggle}
          onThresholdChange={handleThresholdChange}
        />
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`w-full btn-primary flex items-center justify-center space-x-2 text-lg group ${
            !isValid ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <span>Analyze Weather Likelihood</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        
        {!isValid && (
          <p className="text-yellow-400 text-sm mt-2 text-center">
            Please select at least one weather condition
          </p>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-blue-200">
          <strong>Note:</strong> Results are based on historical NASA Earth observation data from 1980 to present. 
          These probabilities represent historical patterns, not weather forecasts.
        </p>
      </div>
    </div>
  );
};

export default QueryInput;
