import React, { useState } from "react";
import Steps from "./Steps";
import CreatePropertyListStep1 from "./CreatePropertyListStep1";
import CreatePropertyListStep2 from "./CreatePropertyListStep2";
import CreatePropertyListStep3 from "./CreatePropertyListStep3";
import { createPropertyListing, updatePropertyListing } from "../../Api/action"; // ✅ Import API

export default function CreatePropertyPage({ goBack }) {
    const [step, setStep] = useState(1);
    const [propertyData, setPropertyData] = useState({}); // Store data across steps
    const [createdId, setCreatedId] = useState(null); // For updates after creation

    const steps = [
        { title: "Create Property", label: "Listing & Property Information" },
        { title: "Create Property", label: "Media & Financial Information" },
        { title: "Create Property", label: "Contact / Management Details" },
        { title: "Create Property", label: "Review and Publish" },
    ];

    const handleNext = async (dataFromStep) => {
        // Merge incoming step data
        const updated = { ...propertyData, ...dataFromStep };
        setPropertyData(updated);

        // On step 1 — create new property
        if (step === 1) {
            try {
                const res = await createPropertyListing(updated);
                setCreatedId(res.data.data._id);
                console.log("✅ Property created:", res.data.data._id);
                setStep(2);
            } catch (err) {
                console.error("Error creating property:", err);
            }
        }
        // On later steps — update existing property
        else if (createdId) {
            try {
                await updatePropertyListing(createdId, updated);
                setStep((s) => Math.min(s + 1, steps.length));
            } catch (err) {
                console.error("Error updating property:", err);
            }
        }
    };

    const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return <CreatePropertyListStep1 onNext={handleNext} initialData={propertyData} />;
            case 2:
                return <CreatePropertyListStep2 onNext={handleNext} onPrev={handlePrev} initialData={propertyData} />;
            case 3:
                return <CreatePropertyListStep3 onNext={handleNext} onPrev={handlePrev} initialData={propertyData} />;
            case 4:
                return (
                    <div className="p-10 text-center">
                        <h2 className="text-2xl font-semibold mb-4">🎉 Property Created Successfully!</h2>
                        <p>All data saved in both English and Vietnamese fields.</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Steps
            steps={steps}
            currentStep={step}
            onNext={() => handleNext({})}
            onPrev={handlePrev}
            onCancel={goBack}
        >
            {renderStepContent()}
        </Steps>
    );
}
