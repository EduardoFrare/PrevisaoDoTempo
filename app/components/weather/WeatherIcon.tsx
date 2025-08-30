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
  LucideProps, // Correção: Importar LucideProps em vez de IconProps
} from "lucide-react";
import React from "react";

// Correção: Usar LucideProps
interface WeatherIconProps extends LucideProps {
  code: number;
}

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