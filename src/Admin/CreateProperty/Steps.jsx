import React from "react";
import { ArrowLeft } from "lucide-react";

export default function Steps({
  steps,
  currentStep,
  onNext,
  onPrev,
  onCancel,
  onSubmit, // ✅ Add this line
  children,
}) {
  return (
    <div className="min-h-screen bg-[#f9f9fb] flex flex-col">
      {/* Header */}
      <div className="px-10 pt-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onCancel}
            className="p-2 rounded-full bg-black hover:bg-gray-800 transition"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">
            {steps[currentStep - 1]?.title || "Create Property"}
          </h1>
        </div>

        {/* Step Indicator */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between px-6 py-3">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = currentStep === stepNumber;
            const isCompleted = stepNumber < currentStep;

            return (
              <div
                key={index}
                className="flex items-center gap-2 w-1/4 justify-center"
              >
                <div
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold ${
                    isActive
                      ? "bg-black text-white"
                      : isCompleted
                      ? "bg-[#b8a8f9] text-white"
                      : "bg-[#e4dffb] text-[#5d4bb5]"
                  }`}
                >
                  {stepNumber}
                </div>
                <span
                  className={`text-sm ${
                    isActive
                      ? "text-black font-medium"
                      : "text-gray-500 font-normal"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scrollable Step Content */}
      <div className="flex-1 mt-3 px-10 overflow-y-auto pb-32">{children}</div>

      {/* Fixed Footer Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-[#f1effb] px-10 py-5 border-t shadow-inner flex justify-end gap-3 z-50">
        {/* Cancel only on Step 1 */}
        {currentStep === 1 && (
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-gray-100"
          >
            Cancel
          </button>
        )}

        {/* Previous visible on Step > 1 */}
        {currentStep > 1 && (
          <button
            onClick={onPrev}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-gray-100"
          >
            Previous
          </button>
        )}

        {/* Next or Submit */}
        {currentStep < steps.length - 1 ? (
          <button
            onClick={onNext}
            className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 flex items-center gap-2"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={onSubmit}
            className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 flex items-center gap-2"
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
}
