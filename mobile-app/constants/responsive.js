import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isSmall = width < 360;
  const isMedium = width >= 360 && width < 430;
  const isLarge = width >= 430;

  // Scale against a 390px baseline to keep UI proportional across mobile sizes.
  const scale = (size) => {
    const scaled = (width / 390) * size;
    return Math.round(Math.max(size * 0.9, Math.min(scaled, size * 1.2)));
  };

  return {
    width,
    height,
    isSmall,
    isMedium,
    isLarge,
    scale,
  };
}
