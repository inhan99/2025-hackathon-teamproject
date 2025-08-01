import React from "react";
import useScrollFadeIn from "../../hooks/UseScrollFadeIn";

const LevelCard = ({ level, label, img, desc, delay = 0 }) => {
  const [ref, visible] = useScrollFadeIn();

  return (
    <div
      ref={ref}
      className={`bg-white p-6 rounded-xl shadow-xl text-center transition-all duration-700 ease-out transform ${
        visible ? "opacity-100 scale-100" : "opacity-0 scale-90"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <img
        src={img}
        alt={label}
        className="mx-auto mb-4 w-20 h-20 animate-bounce-slow"
      />
      <h3 className="text-xl font-semibold mb-2 text-green-700">
        레벨 {level} - {label}
      </h3>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
};

export default LevelCard;
