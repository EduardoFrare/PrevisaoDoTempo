// app/components/weather/WeatherIcon.tsx
import {
  Sun,
  Cloud,
  Cloudy,
  CloudRain,
  CloudSnow,
  CloudFog,
  CloudDrizzle,
  CloudLightning,
  LucideProps,
} from "lucide-react";
import React from "react";

interface WeatherIconProps extends LucideProps {
  code: number;
  // Correção: Adicionar a propriedade 'title' opcional
  title?: string;
}

/**
 * A component that displays a weather icon based on a weather code.
 * @param {object} props - The component props.
 * @param {number} props.code - The weather code.
 * @param {string} [props.title] - The title for the icon (used for tooltips).
 * @returns The appropriate weather icon component.
 */
export const WeatherIcon: React.FC<WeatherIconProps> = ({
  code,
  ...props
}) => {
  const getIcon = (code: number) => {
    switch (true) {
      case code === 0:
        return <Sun {...props} />;
      case code >= 1 && code <= 3:
        return <Cloudy {...props} />;
      case code === 45 || code === 48:
        return <CloudFog {...props} />;
      case (code >= 51 && code <= 57) || (code >= 61 && code <= 67):
        return <CloudRain {...props} />;
      case (code >= 71 && code <= 77) || (code >= 85 && code <= 86):
        return <CloudSnow {...props} />;
      case code >= 80 && code <= 82:
        return <CloudDrizzle {...props} />;
      case code === 95 || code === 96 || code === 99:
        return <CloudLightning {...props} />;
      default:
        return <Cloud {...props} />;
    }
  };

  return getIcon(code);
};