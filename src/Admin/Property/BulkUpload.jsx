import React, { useState, useRef } from "react";
import {
  Upload,
  X,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";
import { useNavigate, useParams } from "react-router-dom";
import { CommonToaster } from "../../Common/CommonToaster";
import { bulkUploadProperties } from "../../Api/action";

export default function BulkUpload() {
  const { type } = useParams(); // 'lease', 'sale', or 'homestay'
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const fileInputRef = useRef(null);

  console.log("🔧 BulkUpload component loaded");
  console.log("🔧 URL type parameter:", type);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState(null);
  const [errors, setErrors] = useState([]);
  const [pendingUploadData, setPendingUploadData] = useState(null);

  // Define field mappings for each transaction type
  const fieldMappings = {
    lease: [
      "Project / Community",
      "Area / Zone",
      "Block Name",
      "Property No",
      "Property Type",
      "Available From",
      "Unit",
      "Unit Size",
      "Bedrooms",
      "Bathrooms",
      "Floor Range",
      "Furnishing",
      "View",
      "Property Title",
      "Description",
      "Currency",
      "Lease Price",
    ],
    sale: [
      "Project / Community",
      "Area / Zone",
      "Block Name",
      "Property No",
      "Property Type",
      "Available From",
      "Unit",
      "Unit Size",
      "Bedrooms",
      "Bathrooms",
      "Floor Range",
      "Furnishing",
      "View",
      "Property Title",
      "Description",
      "Currency",
      "Sale Price",
    ],
    homestay: [
      "Project / Community",
      "Area / Zone",
      "Block Name",
      "Property No",
      "Property Type",
      "Unit",
      "Unit Size",
      "Bedrooms",
      "Bathrooms",
      "Floor Range",
      "Furnishing",
      "View",
      "Property Title",
      "Description",
      "Currency",
      "Price Per Night",
    ],
  };

  const currentFields = fieldMappings[type] || fieldMappings.lease;

  // Generate sample CSV template
  const generateTemplate = () => {
    const headers = currentFields.join(",");
    const sampleRow = currentFields
      .map((field) => {
        if (field.includes("Price")) return "1000";
        if (field === "Bedrooms" || field === "Bathrooms") return "2";
        if (field === "Unit Size") return "1200";
        if (field === "Currency") return "USD";
        if (field === "Available From") return "2024-01-01";
        return `Sample ${field}`;
      })
      .join(",");

    const csvContent = `${headers}\n${sampleRow}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${type}_properties_template_${new Date().getTime()}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    CommonToaster("Template downloaded successfully", "success");
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith(".csv")) {
        CommonToaster("Please select a CSV file", "error");
        return;
      }
      setSelectedFile(file);
      setUploadResults(null);
      setErrors([]);
    }
  };

  // Parse CSV file
  const parseCSV = (text) => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length === 0) return { headers: [], rows: [] };

    const headers = lines[0].split(",").map((h) => h.trim());
    const rows = lines.slice(1).map((line, index) => {
      const values = line.split(",").map((v) => v.trim());
      const rowData = {};
      headers.forEach((header, i) => {
        rowData[header] = values[i] || "";
      });
      return { rowNumber: index + 2, data: rowData }; // +2 because row 1 is header
    });

    return { headers, rows };
  };

  // Validate row against master fields
  const validateRow = (rowData, rowNumber) => {
    const errors = [];
    const missingFields = [];

    currentFields.forEach((field) => {
      if (!rowData[field] || rowData[field].trim() === "") {
        missingFields.push(field);
      }
    });

    // Check for extra fields
    const extraFields = Object.keys(rowData).filter(
      (key) => !currentFields.includes(key)
    );

    if (missingFields.length > 0) {
      errors.push({
        rowNumber,
        type: "missing_fields",
        message: `Missing required fields: ${missingFields.join(", ")}`,
        fields: missingFields,
      });
    }

    if (extraFields.length > 0) {
      errors.push({
        rowNumber,
        type: "extra_fields",
        message: `Unknown fields: ${extraFields.join(", ")}`,
        fields: extraFields,
      });
    }

    // Validate numeric fields
    const numericFields = ["Bedrooms", "Bathrooms", "Unit Size"];
    const priceField = currentFields.find((f) => f.includes("Price"));

    numericFields.forEach((field) => {
      if (
        currentFields.includes(field) &&
        rowData[field] &&
        isNaN(rowData[field])
      ) {
        errors.push({
          rowNumber,
          type: "invalid_format",
          message: `${field} must be a number`,
          field,
        });
      }
    });

    if (priceField && rowData[priceField] && isNaN(rowData[priceField])) {
      errors.push({
        rowNumber,
        type: "invalid_format",
        message: `${priceField} must be a number`,
        field: priceField,
      });
    }

    // Validate date format for Available From
    if (
      currentFields.includes("Available From") &&
      rowData["Available From"]
    ) {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(rowData["Available From"])) {
        errors.push({
          rowNumber,
          type: "invalid_format",
          message: "Available From must be in YYYY-MM-DD format",
          field: "Available From",
        });
      }
    }

    return errors;
  };

  // Handle file upload - Phase 1: Validate only
  const handleUpload = async () => {
    if (!selectedFile) {
      CommonToaster("Please select a file first", "error");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setErrors([]);

    try {
      // Read file
      const text = await selectedFile.text();
      const { headers, rows } = parseCSV(text);

      // Validate headers
      const headerErrors = [];
      currentFields.forEach((field) => {
        if (!headers.includes(field)) {
          headerErrors.push(field);
        }
      });

      if (headerErrors.length > 0) {
        CommonToaster(
          `CSV template mismatch. Missing columns: ${headerErrors.join(", ")}`,
          "error"
        );
        setUploading(false);
        return;
      }

      // Simulate initial progress
      setUploadProgress(20);

      // Get transaction type from URL
      const transactionTypeMap = {
        lease: "Lease",
        sale: "Sale",
        homestay: "Home Stay",
      };
      const transactionType = transactionTypeMap[type];

      console.log("🔍 Transaction Type:", transactionType);
      console.log("🔍 CSV Data Length:", text.length);
      console.log("🔍 About to call bulkUploadProperties with:");
      console.log("   - Param 1 (csvData):", text.substring(0, 50) + "...");
      console.log("   - Param 2 (transactionType):", transactionType);
      console.log("   - Param 3 (validateOnly): true");

      // Call backend API with validateOnly=true
      setUploadProgress(40);
      const response = await bulkUploadProperties(text, transactionType, true);

      setUploadProgress(80);

      if (response?.data?.success) {
        const results = response.data.data;
        
        // Format errors for display
        const formattedErrors = results.errors.map((err) => ({
          rowNumber: err.row,
          type: "validation_error",
          message: err.errors.map((e) => e.message).join(", "),
          fields: err.errors.map((e) => e.field),
        }));

        setErrors(formattedErrors);
        setUploadResults({
          total: results.total,
          successful: results.successful,
          failed: results.failed,
          validRows: results.validRows,
        });

        // Store CSV data for later upload
        setPendingUploadData({
          csvData: text,
          transactionType: transactionType,
          validCount: results.successful,
          errorCount: results.failed,
        });

        setUploadProgress(100);

        if (results.failed === 0) {
          CommonToaster(
            `All ${results.successful} rows are valid! Click 'Upload Valid Rows' to proceed.`,
            "success"
          );
        } else if (results.successful > 0) {
          CommonToaster(
            `${results.successful} rows are valid, ${results.failed} have errors. You can upload the valid rows only.`,
            "warning"
          );
        } else {
          CommonToaster(
            `All rows have errors. Please fix them and try again.`,
            "error"
          );
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      console.error("Error response:", error.response);
      const errorMessage = error.response?.data?.error || "Failed to process CSV file";
      CommonToaster(errorMessage, "error");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  // Handle confirmed upload of only valid rows
  const handleConfirmedUpload = async () => {
    if (!pendingUploadData) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      console.log("✅ Uploading valid rows only...");
      setUploadProgress(30);

      // Call backend API with validateOnly=false to actually upload
      const response = await bulkUploadProperties(
        pendingUploadData.csvData,
        pendingUploadData.transactionType,
        false // validateOnly = false, so it will actually create properties
      );

      setUploadProgress(80);

      if (response?.data?.success) {
        const results = response.data.data;
        
        setUploadProgress(100);
        
        CommonToaster(
          `Successfully uploaded ${results.successful} properties!`,
          "success"
        );

        // Update results to show upload is complete
        setUploadResults({
          total: results.total,
          successful: results.successful,
          failed: results.failed,
          validRows: results.successfulProperties,
          uploaded: true, // Mark as uploaded
        });

        setPendingUploadData(null);
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error.response?.data?.error || "Failed to upload properties";
      CommonToaster(errorMessage, "error");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  // Reset upload
  const handleReset = () => {
    setSelectedFile(null);
    setUploadResults(null);
    setErrors([]);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getTransactionTypeLabel = () => {
    if (type === "lease") return "Lease";
    if (type === "sale") return "Sale";
    if (type === "homestay") return "Home Stay";
    return "";
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <h1 className="text-3xl font-semibold text-gray-900">
          Bulk Upload - {getTransactionTypeLabel()} Properties
        </h1>
        <p className="text-gray-600 mt-2">
          Upload multiple properties at once using a CSV file
        </p>
      </div>

      {/* Template Download Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Download className="w-6 h-6 text-[#41398B]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Download CSV Template
            </h3>
            <p className="text-gray-600 mb-4">
              Download the template file with the correct format for{" "}
              {getTransactionTypeLabel()} properties. Fill in your data and
              upload it back.
            </p>
            <button
              onClick={generateTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-[#41398B] hover:bg-[#41398B] text-white rounded-lg transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download Template
            </button>
          </div>
        </div>

        {/* Required Fields Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Required Fields:
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {currentFields.map((field, index) => (
              <div
                key={index}
                className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg"
              >
                {field}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Upload CSV File
        </h3>

        {/* File Input */}
        <div className="mb-6">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
              selectedFile
                ? "border-green-400 bg-green-50"
                : "border-gray-300 hover:border-gray-400 bg-gray-50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              {selectedFile ? (
                <>
                  <FileText className="w-12 h-12 text-green-600 mb-3" />
                  <p className="text-lg font-medium text-gray-900 mb-1">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-lg font-medium text-gray-900 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-600">CSV files only</p>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
              !selectedFile || uploading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#41398B] hover:bg-[#41398be3] text-white cursor-pointer"
            }`}
          >
            <Upload className="w-4 h-4" />
            {uploading ? "Processing..." : "Upload & Validate"}
          </button>

          {selectedFile && (
            <button
              onClick={handleReset}
              disabled={uploading}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
              Reset
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {uploading && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Processing...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-[#41398B] h-full transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {uploadResults && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Upload Results
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium mb-1">
                Total Rows
              </p>
              <p className="text-3xl font-bold text-blue-700">
                {uploadResults.total}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium mb-1">
                Successful
              </p>
              <p className="text-3xl font-bold text-green-700">
                {uploadResults.successful}
              </p>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-600 font-medium mb-1">Failed</p>
              <p className="text-3xl font-bold text-red-700">
                {uploadResults.failed}
              </p>
            </div>
          </div>

          {/* Success Message - Not Yet Uploaded */}
          {errors.length === 0 && !uploadResults.uploaded && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">
                    All {uploadResults.successful} rows are valid!
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Click the button below to upload these properties to the database.
                  </p>
                </div>
              </div>
              <button
                onClick={handleConfirmedUpload}
                disabled={uploading}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Uploading..." : `Upload ${uploadResults.successful} Corrected Values`}
              </button>
            </div>
          )}

          {/* Success Message - Already Uploaded */}
          {errors.length === 0 && uploadResults.uploaded && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">
                  Upload Complete!
                </p>
                <p className="text-sm text-green-700 mt-1">
                  {uploadResults.successful} properties have been uploaded successfully.
                </p>
              </div>
            </div>
          )}

          {/* Partial Success Message with Action Button - Not Yet Uploaded */}
          {errors.length > 0 && uploadResults.successful > 0 && !uploadResults.uploaded && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-900">
                    Validation Complete
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    {uploadResults.successful} rows are valid and ready to upload. {uploadResults.failed} rows have errors and will be skipped.
                  </p>
                </div>
              </div>
              <button
                onClick={handleConfirmedUpload}
                disabled={uploading}
                className="w-full px-6 py-3 bg-[#41398B] hover:bg-[#41398be3] text-white rounded-lg font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Uploading..." : `Upload ${uploadResults.successful} Corrected Values`}
              </button>
            </div>
          )}

          {/* Partial Success - Already Uploaded */}
          {errors.length > 0 && uploadResults.successful > 0 && uploadResults.uploaded && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">
                    Partial Upload Completed
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    {uploadResults.successful} properties were uploaded successfully. {uploadResults.failed} rows had errors and were skipped.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* All Failed Message */}
          {errors.length > 0 && uploadResults.successful === 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">
                    Upload Failed - All Rows Have Errors
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    Please fix the errors below and try uploading again.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Errors Section */}
      {errors.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">
              Validation Errors ({errors.length})
            </h3>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {errors.map((error, index) => (
              <div
                key={index}
                className="p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {error.rowNumber}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-red-900 mb-1">
                      Row {error.rowNumber}
                    </p>
                    <p className="text-sm text-red-700">{error.message}</p>
                    {error.type === "missing_fields" && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {error.fields.map((field, i) => (
                          <span
                            key={i}
                            className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded"
                          >
                            {field}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Please fix the errors in your CSV file and
              upload again. Make sure all field names match exactly with the
              template.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
