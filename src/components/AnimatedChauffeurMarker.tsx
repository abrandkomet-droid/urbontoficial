import React, { useEffect, useState, useRef } from 'react';
import { OverlayView } from '@react-google-maps/api';
import { motion, useSpring, useTransform } from 'motion/react';

interface AnimatedChauffeurMarkerProps {
  position: google.maps.LatLngLiteral;
  heading: number;
  autoCenter?: boolean;
  map?: google.maps.Map | null;
}

export default function AnimatedChauffeurMarker({ position, heading, autoCenter, map }: AnimatedChauffeurMarkerProps) {
  // Use springs for smooth transitions
  const latSpring = useSpring(position.lat, { stiffness: 50, damping: 20 });
  const lngSpring = useSpring(position.lng, { stiffness: 50, damping: 20 });
  const rotationSpring = useSpring(heading, { stiffness: 50, damping: 20 });

  const [currentPos, setCurrentPos] = useState(position);
  const [currentRotation, setCurrentRotation] = useState(heading);

  useEffect(() => {
    latSpring.set(position.lat);
    lngSpring.set(position.lng);
  }, [position.lat, position.lng, latSpring, lngSpring]);

  useEffect(() => {
    rotationSpring.set(heading);
  }, [heading, rotationSpring]);

  useEffect(() => {
    const unsubscribeLat = latSpring.on('change', (v) => setCurrentPos(prev => ({ ...prev, lat: v })));
    const unsubscribeLng = lngSpring.on('change', (v) => setCurrentPos(prev => ({ ...prev, lng: v })));
    const unsubscribeRot = rotationSpring.on('change', (v) => setCurrentRotation(v));

    return () => {
      unsubscribeLat();
      unsubscribeLng();
      unsubscribeRot();
    };
  }, [latSpring, lngSpring, rotationSpring]);

  // Auto-center logic
  useEffect(() => {
    if (autoCenter && map) {
      map.panTo(currentPos);
    }
  }, [currentPos, autoCenter, map]);

  return (
    <OverlayView
      position={currentPos}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div style={{ transform: 'translate(-50%, -50%)' }}>
        <motion.div
          style={{
            rotate: currentRotation,
            width: 50,
            height: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Suburban Silver Custom Component */}
          <div className="relative">
            {/* Shadow */}
            <div className="absolute inset-0 bg-black/20 blur-md rounded-full scale-110 -z-10" />
            
            {/* Car Image/Icon */}
            <div className="w-10 h-16 bg-[#C0C0C0] rounded-lg border-2 border-[#001F3F] relative flex flex-col items-center justify-between p-1 shadow-lg">
              {/* Windshield */}
              <div className="w-full h-4 bg-[#001F3F]/80 rounded-t-md" />
              {/* Roof */}
              <div className="w-full flex-1 bg-[#C0C0C0]" />
              {/* Rear Window */}
              <div className="w-full h-2 bg-[#001F3F]/80 rounded-b-sm" />
              
              {/* Headlights */}
              <div className="absolute -top-1 left-1 w-1.5 h-1 bg-yellow-200 rounded-full shadow-[0_0_5px_rgba(255,255,200,0.8)]" />
              <div className="absolute -top-1 right-1 w-1.5 h-1 bg-yellow-200 rounded-full shadow-[0_0_5px_rgba(255,255,200,0.8)]" />
              
              {/* Taillights */}
              <div className="absolute -bottom-1 left-1 w-1.5 h-1 bg-red-500 rounded-full" />
              <div className="absolute -bottom-1 right-1 w-1.5 h-1 bg-red-500 rounded-full" />
            </div>
          </div>
        </motion.div>
      </div>
    </OverlayView>
  );
}
