from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from img_processing_utils import process_image
import uvicorn

app = FastAPI(title="Lost and Found Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/identify")
async def identiy_item(file: UploadFile = File(...)):
    image_data = await file.read()
    
    data = process_image(image_data)
    
    return {
        "file_name": file.filename,
        "data": data
    }
    
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)