import React, { useState, useRef } from "react";

interface CursorTiltCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const CursorTiltCard: React.FC<CursorTiltCardProps> = ({ children, onClick, className = "" }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  const [glare, setGlare] = useState({ opacity: 0, x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate cursor position relative to card center (-1 to 1)
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = (mouseX / width) - 0.5;
    const yPct = (mouseY / height) - 0.5;

    // Max rotation in degrees
    const maxRotate = 8;
    const rotateX = -yPct * maxRotate;
    const rotateY = xPct * maxRotate;

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`);
    setGlare({
      opacity: 0.35,
      x: (mouseX / width) * 100,
      y: (mouseY / height) * 100
    });
  };

  const handleMouseLeave = () => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    setGlare({ opacity: 0, x: 50, y: 50 });
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: transform.includes("0deg") ? "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)" : "transform 0.1s ease-out"
      }}
      className={`relative cursor-pointer select-none overflow-hidden rounded-3xl transition-shadow duration-300 ${className}`}
    >
      {/* Glare spotlight follower */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl transition-opacity duration-300 z-10"
        style={{
          opacity: glare.opacity,
          background: `radial-gradient(400px circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.7), transparent 60%)`
        }}
      />
      {children}
    </div>
  );
};
