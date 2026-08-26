import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Register the plugin if you are in a build environment that requires it
gsap.registerPlugin(useGSAP);

export default function Loading() {
  const containerRef = useRef<HTMLDivElement>(null);
  const circleOneRef = useRef<HTMLDivElement>(null);
  const circleTwoRef = useRef<HTMLDivElement>(null);
  const circleThreeRef = useRef<HTMLDivElement>(null);

  // Configuration variables
  // const centerX = 200; // X coordinate of the center point
  // const centerY = 200; // Y coordinate of the center point
  const maxRadius = 25; // Distance from the center point
  const TWO_THIRDS_PI = (Math.PI * 2) / 3;

  useGSAP(
    () => {
      // Create an object to hold animated angle and radius variable
      const rawData = { angle: 0, radius: 0 };
      const container = containerRef.current;

      if (!container) return;

      const { width, height } = container.getBoundingClientRect();
      const centerX = width / 2;
      const centerY = height / 2;

      gsap.to(rawData, {
        angle: Math.PI * 2, // Animate through a full circle (360 degrees in radians)
        duration: 1, // Time taken for one full orbit (in seconds)
        repeat: -1, // Infinite loop
        ease: "none", // Constant speed
        onUpdate: () => {
          // Dynamic calculation safely fallback if width/height registers as 0 early on
          const rect = container.getBoundingClientRect();
          const centerX = (rect.width || 100) / 2;
          const centerY = (rect.height || 100) / 2;

          // Calculate the new X and Y positions using trigonometry
          [
            circleOneRef.current,
            circleTwoRef.current,
            circleThreeRef.current,
          ].map((el, i) => {
            const a = rawData.angle + i * TWO_THIRDS_PI;
            const x = centerX + Math.cos(a) * rawData.radius;
            const y = centerY + Math.sin(a) * rawData.radius;
            gsap.set(el, { x, y, xPercent: -50, yPercent: -50, ease: "none" });
          });
        },
      });
      gsap.to(rawData, {
        radius: maxRadius,
        duration: 1.5,
        yoyo: true,
        repeat: -1,
        ease: "none",
      });

      // Optimized scale animations using a single shared array tween
      const circles = [circleOneRef.current, circleTwoRef.current, circleThreeRef.current];
      circles.forEach((circle, index) => {
        gsap.to(circle, {
          scale: 0.5,
          yoyo: true,
          repeat: -1,
          duration: 1,
          ease: "none",
          delay: index * 0.3, // Cleansed manual sequence offsets
        });
      });

      gsap.to(
        circles,
        {
          backgroundColor: "#15ff00",
          duration: 1.5,
          repeat: -1,
          yoyo: true,
        },
      );
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100px",
        height: "100px",
      }}
    >
      <div
        ref={circleOneRef}
        style={{
          position: "absolute",
          top: "0px",
          bottom: "0px", // Switch to bottom: 0px to prevent layout distortion
          width: "25px",
          height: "25px",
          background: "#ff00f2",
          borderRadius: "25px",
        }}
      />
      <div
        ref={circleTwoRef}
        style={{
          position: "absolute",
          top: "0px",
          bottom: "0px",
          width: "25px",
          height: "25px",
          background: "#ff00f2",
          borderRadius: "25px",
        }}
      />
      <div
        ref={circleThreeRef}
        style={{
          position: "absolute",
          top: "0px",
          bottom: "0px",
          width: "25px",
          height: "25px",
          background: "#ff00f2",
          borderRadius: "25px",
        }}
      />
    </div>
  );
}
