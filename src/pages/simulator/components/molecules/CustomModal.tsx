import { useState } from "react";
import { CustomModalProps } from "../../../../types";
import { AnimatedButtonModal } from "../../../../shared/components/AnimatedButtonModal";

export function CustomModal({
  title,
  description,
  structure,
  example,
  children,
  onClose,
}: CustomModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  return (
    <>
      <div onClick={openModal} className="cursor-pointer">
        {children}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#101014] rounded-2xl shadow-xl p-6 w-full max-w-md border border-[#2E2E2E]">
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-extrabold text-[#E0E0E0] mb-4 text-center tracking-wide">
                <span className="text-[#D72638]">{title}</span>
              </h2>

              <div className="text-sm sm:text-base text-[#A0A0A0] space-y-3 w-full px-2">
                <p>
                  <span className="font-semibold text-[#D72638]">
                    🧠 Funcionalidad:
                  </span>{" "}
                  {description}
                </p>
                <p>
                  <span className="font-semibold text-[#1E88E5]">
                    🛠️ Estructura del comando:
                  </span>{" "}
                  {/* {structure} */}
                  <span dangerouslySetInnerHTML={{ __html: structure }} />
                </p>
                <p>
                  <span className="font-semibold text-[#00C896]">
                    📌 Ejemplo de uso:
                  </span>{" "}
                  <span dangerouslySetInnerHTML={{ __html: example }} />
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <AnimatedButtonModal
                bgColor="#D72638"
                text="Aceptar"
                onClick={closeModal}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
