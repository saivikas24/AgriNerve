from io import BytesIO

from fastapi import APIRouter, File, UploadFile, status
from PIL import Image

from app.schemas.disease import DiseasePredictionResponse
from app.services.disease_service import predict_disease


router = APIRouter(
    prefix="/disease",
    tags=["Disease Detection"],
)


@router.post(
    "/predict",
    response_model=DiseasePredictionResponse,
    status_code=status.HTTP_200_OK,
)
async def predict(
    image: UploadFile = File(...),
):
    if image.content_type not in {
        "image/jpeg",
        "image/png",
        "image/jpg",
    }:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=400,
            detail="Only JPG, JPEG, and PNG images are supported",
        )

    contents = await image.read()

    try:
        pil_image = Image.open(BytesIO(contents))
        pil_image.load()
    except Exception:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=400,
            detail="Invalid image file",
        )

    result = predict_disease(pil_image)

    return result