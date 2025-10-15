import React, { useState } from "react";
import ManageProperty from "./ManageProperty";
import CreatePropertyListStep4 from "../CreateProperty/CreatePropertyListStep4";

export default function PropertyManager({ openCreateProperty, openEditProperty }) {
    const [activeStep, setActiveStep] = useState("list"); // "list" | "view"
    const [selectedPropertyId, setSelectedPropertyId] = useState(null);

    const handleViewProperty = (propertyId) => {
        setSelectedPropertyId(propertyId);
        setActiveStep("view");
    };

    const handleBackToList = () => {
        setSelectedPropertyId(null);
        setActiveStep("list");
    };

    return (
        <div className="min-h-screen bg-[#f9f9fc]">
            {activeStep === "list" && (
                <ManageProperty
                    openCreateProperty={openCreateProperty}
                    openEditProperty={openEditProperty}
                    onViewProperty={handleViewProperty}
                />
            )}

            {activeStep === "view" && (
                <CreatePropertyListStep4
                    savedId={selectedPropertyId}
                    onPrev={handleBackToList}
                    onPublish={() => handleBackToList()}
                />
            )}
        </div>
    );
}
