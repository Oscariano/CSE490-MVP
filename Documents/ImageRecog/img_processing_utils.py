import cv2
import numpy as np
from ultralytics import YOLO
import easyocr
from PIL import Image


model = YOLO("yolov8n.pt")
reader = easyocr.Reader(['en'])


def get_color(image, k=1):
    pixels = image.reshape((-1, 3))
    pixels = np.float32(pixels)

    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
    _, labels, centers = cv2.kmeans(pixels, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)

    dominant_color = centers[0].astype(int)
    
    dominant_color = dominant_color[::-1] 
    
    colors = {
        "Red": (255, 0, 0),
        "Green": (0, 255, 0),
        "Blue": (0, 0, 255),
        "Yellow": (255, 255, 0),
        "White": (255, 255, 255),
        "Black": (0, 0, 0),
        "Orange": (255, 165, 0),
        "Purple": (128, 0, 128),
        "Grey": (128, 128, 128),
        "Brown": (165, 42, 42)
    }
    
    distances = {}
    for name, value in colors.items():
        dist = np.linalg.norm(np.array(dominant_color) - np.array(value))
        distances[dist] = name
        
    return distances[min(distances.keys())]

def get_text(images):
    results = reader.readtext(images)
    text_found = " ".join([res[1] for res in results])
    return text_found
    

def process_image(image_bytes):    
    nparr = np.frombuffer(image_bytes, np.uint8) 
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    results = model(frame)
    
    if len(results[0].boxes) == 0:
        return {"status": "None Found"}
    
    best_idx = results[0].boxes.conf.argmax()
    box = results[0].boxes[best_idx]
    
    conf = float(box.conf[0])
    if conf < 0.6:
        return {"status": "Low Confidence", "confidence": conf}
    
    label = model.names[int(box.cls[0])]
    
    coords = box.xyxy[0].cpu().numpy().astype(int)
    x1, y1, x2, y2 = coords
    
    h, w, _ = frame.shape
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(w, x2), min(h, y2)
    
    crop = frame[y1:y2, x1:x2]
    
    if crop.size == 0:
        return {"error": "Invalid crop dimensions"}
    
    color = get_color(crop)
    text = get_text(crop)
    
    return {
        "item": str(label),
        "color": str(color),
        "text": str(text),
        "confidence": float(conf),
        "box": [int(x1), int(y1), int(x2), int(y2)]
    }