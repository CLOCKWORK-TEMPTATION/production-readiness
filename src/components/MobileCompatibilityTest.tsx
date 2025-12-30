import { useEffect, useState } from 'react';
import { checkMobileCompatibility } from '../utils/mobile-compatibility';

interface MobileCompatibilityInfo {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  supportsTouchEvents: boolean;
  supportsPointerEvents: boolean;
  viewport: {
    width: number;
    height: number;
    devicePixelRatio: number;
  };
}

export const MobileCompatibilityTest = () => {
  const [compatibility, setCompatibility] = useState<MobileCompatibilityInfo | null>(null);

  useEffect(() => {
    const info = checkMobileCompatibility();
    setCompatibility(info);
  }, []);

  if (!compatibility) return null;

  return (
    <div className="mobile-compatibility-info p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Mobile Compatibility Status</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>Mobile Device: {compatibility.isMobile ? '✅' : '❌'}</div>
        <div>iOS: {compatibility.isIOS ? '✅' : '❌'}</div>
        <div>Android: {compatibility.isAndroid ? '✅' : '❌'}</div>
        <div>Touch Events: {compatibility.supportsTouchEvents ? '✅' : '❌'}</div>
        <div>Pointer Events: {compatibility.supportsPointerEvents ? '✅' : '❌'}</div>
        <div>Viewport: {compatibility.viewport.width}x{compatibility.viewport.height}</div>
        <div>DPR: {compatibility.viewport.devicePixelRatio}</div>
      </div>
    </div>
  );
};