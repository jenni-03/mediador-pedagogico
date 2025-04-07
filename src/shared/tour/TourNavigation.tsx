type Props = {
  onPrev: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
};

const TourNavigation: React.FC<Props> = ({
  onPrev,
  onNext,
  isFirst,
  isLast,
}) => (
  <div className="flex justify-between mt-4 gap-2">
    <button
      onClick={onPrev}
      disabled={isFirst}
      className={`px-4 py-2 text-sm rounded-md border border-[#ff0040] transition 
        ${
          isFirst
            ? "bg-transparent text-gray-500 opacity-50 cursor-not-allowed"
            : "bg-[#1c1c1c] text-[#ff0040] hover:bg-[#ff0040] hover:text-black shadow-[0_0_10px_#ff0040]"
        }`}
    >
      Anterior
    </button>

    <button
      onClick={onNext}
      className="px-4 py-2 text-sm rounded-md bg-[#ff0040] text-white font-semibold shadow-[0_0_10px_#ff0040]
        hover:bg-white hover:text-[#ff0040] transition"
    >
      {isLast ? "Finalizar" : "Siguiente"}
    </button>
  </div>
);

export default TourNavigation;
