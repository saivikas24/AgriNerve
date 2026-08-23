import { useState, type ChangeEvent, type DragEvent } from "react";
import "./DiseaseDetection.css";

function DiseaseDetection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }

    setFileName(file.name);

    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);

    // Reset analysis state when a new image is selected
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

  const handleAnalyze = () => {
    if (!selectedImage || isAnalyzing) {
      return;
    }

    setIsAnalyzing(true);

    // Temporary frontend simulation.
    // This will later be replaced with the FastAPI request.
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
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

  return (
    <div className="disease-page">

      {/* Page heading */}

      <section className="disease-heading">
        <div>
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
        </div>
      </section>

      {/* Upload area */}

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

        <p>
          Drag and drop an image here, or choose one
          from your device.
        </p>

        {/* Image selected */}

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

            <label
              htmlFor="crop-image"
              className="secondary-upload-button"
            >
              Choose another image
            </label>

            {/* Analyze button */}

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
        ) : (

          /* No image selected */

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

        {/* Hidden file input */}

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