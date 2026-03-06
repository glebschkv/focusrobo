import { SkyBackground } from './SkyBackground';
import { SunsetBackground } from './SunsetBackground';
import { NightBackground } from './NightBackground';
import { ForestBackground } from './ForestBackground';
import { SnowBackground } from './SnowBackground';
import { CityBackground } from './CityBackground';

// Re-export individual backgrounds for direct imports
export { SkyBackground, SunsetBackground, NightBackground, ForestBackground, SnowBackground, CityBackground };

// Dynamic Background Component for Focus Page
export const FocusBackground = ({ theme }: { theme: string }) => {
  switch (theme) {
    case 'sunset':
      return <SunsetBackground key="sunset" />;
    case 'night':
      return <NightBackground key="night" />;
    case 'forest':
      return <ForestBackground key="forest" />;
    case 'snow':
      return <SnowBackground key="snow" />;
    case 'city':
      return <CityBackground key="city" />;
    default:
      return <SkyBackground key="sky" />;
  }
};
