from pathlib import Path

import torch
import torch.nn as nn
from PIL import Image
from torchvision.models import efficientnet_b0

from torchvision import transforms


# --------------------------------------------------
# Configuration
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[3]

MODEL_PATH = (
    BASE_DIR
    / "ml"
    / "models"
    / "paddy_efficientnet_b0_best.pth"
)

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


# --------------------------------------------------
# Class mapping
# --------------------------------------------------

CLASSES = [
    "bacterial_leaf_blight",
    "bacterial_leaf_streak",
    "bacterial_panicle_blight",
    "blast",
    "brown_spot",
    "dead_heart",
    "downy_mildew",
    "hispa",
    "normal",
    "tungro",
]


# --------------------------------------------------
# Image preprocessing
# Must match training preprocessing
# --------------------------------------------------

TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])


# --------------------------------------------------
# Load model
# --------------------------------------------------

def load_model():
    checkpoint = torch.load(
        MODEL_PATH,
        map_location=DEVICE,
    )

    model = efficientnet_b0(
        weights=None,
    )

    num_features = model.classifier[1].in_features

    model.classifier[1] = nn.Linear(
        num_features,
        len(CLASSES),
    )

    model.load_state_dict(
        checkpoint["model_state_dict"]
    )

    model.to(DEVICE)
    model.eval()

    return model


model = load_model()


# --------------------------------------------------
# Disease prediction
# --------------------------------------------------

def predict_disease(image: Image.Image) -> dict:

    image = image.convert("RGB")

    input_tensor = TRANSFORM(image)

    input_tensor = input_tensor.unsqueeze(0)

    input_tensor = input_tensor.to(DEVICE)

    with torch.no_grad():

        outputs = model(input_tensor)

        probabilities = torch.softmax(
            outputs,
            dim=1,
        )

        confidence, predicted_class = torch.max(
            probabilities,
            dim=1,
        )

    disease = CLASSES[
        predicted_class.item()
    ]

    confidence_value = confidence.item()

    if disease == "normal":

        recommendation = (
            "No major disease detected. "
            "Continue regular crop monitoring."
        )

    else:

        recommendation = (
            f"Potential {disease.replace('_', ' ')} detected. "
            "Monitor the affected crop area and consult "
            "an agriculture expert for appropriate treatment."
        )

    return {
        "disease": disease,
        "confidence": confidence_value,
        "recommendation": recommendation,
    }