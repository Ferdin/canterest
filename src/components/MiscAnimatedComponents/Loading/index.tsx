import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Register the plugin if you are in a build environment that requires it
gsap.registerPlugin(useGSAP);

export default function Loading() {
  const container = useRef(null);
  const circleRef = useRef(null);

  // Configuration variables
  const centerX = 200; // X coordinate of the center point
  const centerY = 200; // Y coordinate of the center point
  const radius = 100; // Distance from the center point

  useGSAP(
    () => {
      // Create an object to hold the animated angle variable
      const rawData = { angle: 0 };

      gsap.to(rawData, {
        angle: Math.PI * 2, // Animate through a full circle (360 degrees in radians)
        duration: 4, // Time taken for one full orbit (in seconds)
        repeat: -1, // Infinite loop
        ease: "none", // Constant speed
        onUpdate: () => {
          // Calculate the new X and Y positions using trigonometry
          const x = centerX + Math.cos(rawData.angle) * radius;
          const y = centerY + Math.sin(rawData.angle) * radius;

          // Apply the positions to the DOM element
          gsap.set(circleRef.current, { x, y, xPercent: -50, yPercent: -50 });
        },
      });
    },
    { scope: container },
  );

  return (
    <div ref={container}>
      {/* The center anchor point (Optional visual guide) */}
      <div
        style={{
          position: "absolute",
          left: centerX,
          top: centerY,
          width: "6px",
          height: "6px",
          background: "red",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Your custom Circle component */}
      <div
        ref={circleRef}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "30px",
          height: "30px",
          background: "#00e6ff",
          borderRadius: "50%",
          boxShadow: "0 0 10px #00e6ff",
        }}
      />
    </div>
  );
}
