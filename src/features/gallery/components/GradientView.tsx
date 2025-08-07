/**
 * GradientView - Linear gradient component using react-native-linear-gradient
 * Replaces expo-linear-gradient functionality
 */

import React from 'react';
import { ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export interface GradientViewProps {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  locations?: number[];
  style?: ViewStyle;
  children?: React.ReactNode;
  angle?: number;
  useAngle?: boolean;
}

export const GradientView: React.FC<GradientViewProps> = ({
  colors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
  locations,
  style,
  children,
  angle,
  useAngle = false,
}) => {
  // Convert angle to start/end coordinates if useAngle is true
  const getGradientCoordinates = () => {
    if (useAngle && angle !== undefined) {
      const radians = (angle * Math.PI) / 180;
      const x = Math.cos(radians);
      const y = Math.sin(radians);
      
      return {
        start: { x: 0.5 - x * 0.5, y: 0.5 - y * 0.5 },
        end: { x: 0.5 + x * 0.5, y: 0.5 + y * 0.5 },
      };
    }
    
    return { start, end };
  };

  const { start: gradientStart, end: gradientEnd } = getGradientCoordinates();

  return (
    <LinearGradient
      colors={colors}
      start={gradientStart}
      end={gradientEnd}
      locations={locations}
      style={style}
    >
      {children}
    </LinearGradient>
  );
};

/**
 * Predefined gradient presets
 */
export const gradientPresets = {
  sunset: {
    colors: ['#FF6B6B', '#FFA62B', '#FF8E8E'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  ocean: {
    colors: ['#667eea', '#764ba2'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  forest: {
    colors: ['#134E5E', '#71B280'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  purple: {
    colors: ['#667eea', '#764ba2'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  dark: {
    colors: ['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.3)', 'transparent'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  selection: {
    colors: ['rgba(0, 123, 255, 0.6)', 'rgba(0, 123, 255, 0.3)'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
} as const;
