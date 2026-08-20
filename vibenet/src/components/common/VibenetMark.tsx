import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface VibenetMarkProps {
  size?: number;
  /** 'badge' = black rounded-square tile with the white mark (matches app icon).
   *  'mark' = just the stroke path, colorable, for placing on an existing surface. */
  variant?: 'badge' | 'mark';
  color?: string;
}

// Ported from assets/images/vibenet-icon.svg (react-native can't load raw .svg
// files as Images without a Metro svg-transformer, which this project doesn't have).
const MARK_PATH =
  'M 82 86 L 118 152 L 148 90 C 158 115 152 145 132 160 C 105 178 62 165 52 120 ' +
  'C 42 72 82 50 122 50 C 172 50 196 85 194 130 C 192 170 162 194 125 195';

export const VibenetMark: React.FC<VibenetMarkProps> = ({ size = 28, variant = 'badge', color = '#FFFFFF' }) => {
  if (variant === 'mark') {
    return (
      <Svg width={size} height={size} viewBox="0 0 240 240">
        <Path
          d={MARK_PATH}
          fill="none"
          stroke={color}
          strokeWidth={15}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 240 240">
      <Rect width={240} height={240} rx={48} fill="#000000" />
      <Path
        d={MARK_PATH}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={15}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
