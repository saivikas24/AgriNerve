import { useState, type ChangeEvent, type DragEvent } from "react";
import "./DiseaseDetection.css";

interface DiseaseResult {
  disease: string;
  confidence: number;
  recommendation: string;
}

function formatDiseaseName(disease: string) {
  if (disease.toLowerCase() === "normal") {
    return "Healthy";
  }

  return disease
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getConfidenceLevel(confidence: number) {
  if (confidence >= 0.8) {
    return {
      label: "High confidence",
      className: "high",
    };
  }

  if (confidence >= 0.5) {
    return {
      label: "Moderate confidence",
      className: "moderate",
    };
  }

  return {
    label: "Low confidence",
    className: "low",
  };
}

function DiseaseDetection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [error, setError] = useState<string>("");

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
    setError("");
    setResult(null);

    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setIsAnalyzing(false);
  };

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    handleFile(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile || isAnalyzing) {
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch(
        "http://127.0.0.1:8000/api/v1/disease/predict",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Disease analysis failed."
        );
      }

      setResult(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to analyze image."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDragOver = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    handleFile(file);
  };

  const confidence = result
    ? result.confidence * 100
    : 0;

  const confidenceLevel = result
    ? getConfidenceLevel(result.confidence)
    : null;

  const isHealthy =
    result?.disease.toLowerCase() === "normal";

  return (
    <div className="disease-page">

      {/* Page heading */}

      <section className="disease-heading">
        <span className="disease-eyebrow">
          CROP HEALTH
        </span>

        <h1>
          Crop Disease Detection
        </h1>

        <p>
          Upload a clear crop-leaf image and AgriNerve
          will analyze it for potential disease.
        </p>
      </section>

      {/* Upload / analysis card */}

      <section
        className={`disease-upload-card ${
          isDragging ? "drag-active" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >

        <div className="upload-icon">
          🌿
        </div>

        <h2>
          Upload a crop-leaf image
        </h2>

        <p className="upload-description">
          Drag and drop an image here, or choose one
          from your device.
        </p>

        {selectedImage ? (
          <div className="image-preview-container">

            <img
              src={selectedImage}
              alt="Selected crop leaf"
              className="image-preview"
            />

            <span className="selected-file">
              {fileName}
            </span>

            <div className="image-actions">

              <label
                htmlFor="crop-image"
                className="secondary-upload-button"
              >
                Choose another image
              </label>

              <button
                type="button"
                className="analyze-button"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing
                  ? "Analyzing..."
                  : "Analyze Image"}
              </button>

            </div>

            {/* Loading */}

            {isAnalyzing && (
              <div className="analysis-loading">
                <div className="loading-spinner" />
                <span>
                  AgriNerve is analyzing your crop...
                </span>
              </div>
            )}

            {/* Result */}

            {result && !isAnalyzing && (
              <div
                className={`disease-result-card ${
                  isHealthy ? "healthy" : "disease"
                }`}
              >

                <div className="result-header">

                  <div
                    className={`result-status-icon ${
                      isHealthy ? "healthy" : "disease"
                    }`}
                  >
                    {isHealthy ? "✓" : "!"}
                  </div>

                  <div>
                    <span className="result-eyebrow">
                      {isHealthy
                        ? "CROP HEALTH STATUS"
                        : "DISEASE DETECTED"}
                    </span>

                    <h3>
                      {formatDiseaseName(result.disease)}
                    </h3>
                  </div>

                </div>

                <div className="confidence-section">

                  <div className="confidence-header">
                    <span>
                      Model confidence
                    </span>

                    <strong>
                      {confidence.toFixed(1)}%
                    </strong>
                  </div>

                  <div className="confidence-track">
                    <div
                      className={`confidence-fill ${confidenceLevel?.className}`}
                      style={{
                        width: `${confidence}%`,
                      }}
                    />
                  </div>

                  <span
                    className={`confidence-label ${confidenceLevel?.className}`}
                  >
                    {confidenceLevel?.label}
                  </span>

                </div>

                <div className="recommendation-box">

                  <span className="recommendation-title">
                    Recommendation
                  </span>

                  <p>
                    {result.recommendation}
                  </p>

                </div>

                {confidence < 0.8 && (
                  <div className="confidence-warning">
                    <span>⚠</span>

                    <p>
                      The model is not highly confident
                      in this prediction. Consider uploading
                      a clearer close-up image for better
                      analysis.
                    </p>
                  </div>
                )}

              </div>
            )}

            {/* Error */}

            {error && (
              <div className="disease-error">
                <span>!</span>
                <p>{error}</p>
              </div>
            )}

          </div>
        ) : (

          /* Empty upload state */

          <>
            <div className="drop-hint">
              Drop your image here
            </div>

            <span className="upload-or">
              or
            </span>

            <label
              htmlFor="crop-image"
              className="upload-button"
            >
              Choose Image
            </label>
          </>
        )}

        <input
          id="crop-image"
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          onChange={handleImageChange}
          hidden
        />

        <span className="upload-hint">
          Supported formats: JPG, JPEG, PNG
        </span>

      </section>
    </div>
  );
}

export default DiseaseDetection;