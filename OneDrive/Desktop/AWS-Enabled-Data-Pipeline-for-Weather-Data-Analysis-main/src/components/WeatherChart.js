import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const WeatherChart = ({ data }) => {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="time" 
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            yAxisId="temp"
            orientation="left"
            stroke="#6b7280"
            fontSize={12}
            label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
          />
          <YAxis 
            yAxisId="humidity"
            orientation="right"
            stroke="#6b7280"
            fontSize={12}
            label={{ value: 'Humidity (%)', angle: 90, position: 'insideRight' }}
          />
          <YAxis 
            yAxisId="precipitation"
            hide
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Line 
            yAxisId="temp"
            type="monotone" 
            dataKey="temperature" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            name="Temperature (°C)"
          />
          <Line 
            yAxisId="humidity"
            type="monotone" 
            dataKey="humidity" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            name="Humidity (%)"
          />
          <Line 
            yAxisId="precipitation"
            type="monotone" 
            dataKey="precipitation" 
            stroke="#06b6d4" 
            strokeWidth={2}
            dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
            name="Precipitation (mm)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeatherChart;
