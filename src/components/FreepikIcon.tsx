import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface FreepikIconProps {
  term: string;
  size?: number;
  className?: string;
  animation?: 'pulse' | 'bounce' | 'spin' | 'float' | 'none';
  fallback?: React.ReactNode;
}

export default function FreepikIcon({ 
  term, 
  size = 24, 
  className = '', 
  animation = 'none',
  fallback 
}: FreepikIconProps) {
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchIcon = async () => {
      try {
        setLoading(true);
        // We use a simple cache to avoid hitting the API too much for the same icon
        const cacheKey = `freepik_icon_${term}`;
        const cached = sessionStorage.getItem(cacheKey);
        
        if (cached) {
          setIconUrl(cached);
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/integrations/freepik/icon?term=${encodeURIComponent(term)}`);
        if (!res.ok) throw new Error('Failed to fetch icon');
        
        const data = await res.json();
        if (data.url) {
          setIconUrl(data.url);
          sessionStorage.setItem(cacheKey, data.url);
        } else {
          throw new Error('No URL returned');
        }
      } catch (err) {
        console.error(`Error loading Freepik icon for term "${term}":`, err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchIcon();
  }, [term]);

  if (loading) {
    return <div style={{ width: size, height: size }} className={`flex items-center justify-center ${className}`}>
      <Loader2 size={size * 0.6} className="animate-spin text-[#001F3F]/30" />
    </div>;
  }

  if (error || !iconUrl) {
    return fallback ? <>{fallback}</> : <div style={{ width: size, height: size }} className={`bg-[#001F3F]/10 rounded-md ${className}`} />;
  }

  const getAnimationProps = () => {
    switch (animation) {
      case 'pulse':
        return {
          animate: { scale: [1, 1.1, 1] },
          transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
        };
      case 'bounce':
        return {
          animate: { y: [0, -5, 0] },
          transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
        };
      case 'spin':
        return {
          animate: { rotate: 360 },
          transition: { repeat: Infinity, duration: 3, ease: "linear" }
        };
      case 'float':
        return {
          animate: { y: [0, -3, 0], rotate: [0, 2, -2, 0] },
          transition: { repeat: Infinity, duration: 3, ease: "easeInOut" }
        };
      default:
        return {};
    }
  };

  return (
    <motion.img 
      src={iconUrl} 
      alt={`${term} icon`}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      referrerPolicy="no-referrer"
      {...getAnimationProps()}
    />
  );
}
