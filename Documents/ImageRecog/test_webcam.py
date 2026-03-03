import cv2
from ultralytics import YOLO
import numpy as np
import easyocr

# Initialize the reader (only do this once)
reader = easyocr.Reader(['en'])

def get_text_features(crop):
    # Run OCR on the cropped object
    results = reader.readtext(crop)
    # Join all detected words into a single string
    text_found = " ".join([res[1] for res in results])
    return text_found

def get_visual_fingerprint(crop):
    orb = cv2.ORB_create(nfeatures=500)
    keypoints, descriptors = orb.detectAndCompute(crop, None)
    
    # Draw them for your webcam test to see what the AI "sees"
    feat_img = cv2.drawKeypoints(crop, keypoints, None, color=(0, 255, 0))
    return feat_img, descriptors

def get_dominant_color(image_crop, k=1):
    # 1. Reshape the image to be a list of pixels
    pixels = image_crop.reshape((-1, 3))
    pixels = np.float32(pixels)

    # 2. Define criteria and apply KMeans
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
    _, labels, centers = cv2.kmeans(pixels, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)

    # 3. Convert back to 8-bit values (0-255)
    dominant_color = centers[0].astype(int) 
    
    # Returns [B, G, R]
    return dominant_color

def get_color_name(rgb_triplet):
    # Define a dictionary of basic colors (feel free to add more!)
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
    
    # Calculate distance to each color in the dict
    distances = {}
    for name, value in colors.items():
        # Euclidean distance formula
        dist = np.linalg.norm(np.array(rgb_triplet) - np.array(value))
        distances[dist] = name
        
    # Return the name of the color with the smallest distance
    return distances[min(distances.keys())]

# 1. Initialize the YOLO model (it will download 'yolov8n.pt' on first run)
model = YOLO('yolov8n.pt') 

# 2. Open the webcam (0 is usually the integrated camera)
cap = cv2.VideoCapture(1)

if not cap.isOpened():
    print("Error: Could not open webcam. Check permissions.")
    exit()

print("Webcam test started. Press 'q' to stop.")

while True:
    # Capture frame-by-frame
    success, frame = cap.read()
    if not success:
        break

    # 3. Run the "Lost & Found" Recognition
    # We set stream=True for better performance in loops
    results = model(frame, stream=True)

    for r in results:
        if len(r.boxes) > 0:
            top_obj = r.boxes.conf.argmax()
            box = r.boxes[top_obj]
            
            # Get coordinates and class name
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            cls = int(box.cls[0])
            label = model.names[cls]
            conf = float(box.conf[0])
            
            
            crop = frame[y1+5:y2-5, x1+5:x2-5]
            
            color = get_dominant_color(crop)
            
            color = color[::-1]
            
            color = get_color_name(color)
            
            text = get_text_features(crop)
            
            _, descriptors = get_visual_fingerprint(crop)
            
            item_data = {"label": label,
                         "color": color,
                         "text": text,
                         "descriptors": descriptors}
            
            print(f"Item Data: {item_data}")

            # 4. Draw the Visuals
            # Draw green box
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            # Draw label background
            cv2.putText(frame, f"{label} {conf:.2f} {color}", (x1, y1 - 10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    # 5. Display the resulting frame
    cv2.imshow('Lost & Found AI Test', frame)

    # Break loop on 'q' key press
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Cleanup

cap.release()
cv2.destroyAllWindows()