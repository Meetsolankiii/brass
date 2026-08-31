import sys
import os
from PIL import Image

def crop_robust(image_path, padding=15, threshold=15):
    if not os.path.exists(image_path):
        print(f"File {image_path} does not exist.")
        return False
        
    try:
        img = Image.open(image_path).convert("RGBA")
        bg_color = img.getpixel((0, 0))
        width, height = img.size
        min_x, min_y, max_x, max_y = width, height, 0, 0
        
        # Scan pixels to find the bounding box of non-background content
        for y in range(height):
            for x in range(width):
                pixel = img.getpixel((x, y))
                # Calculate absolute color difference in RGB channels
                diff = sum(abs(pixel[i] - bg_color[i]) for i in range(3))
                
                # If color differs by more than the threshold, it is logo content
                if diff > threshold:
                    if x < min_x: min_x = x
                    if y < min_y: min_y = y
                    if x > max_x: max_x = x
                    if y > max_y: max_y = y
                    
        if max_x >= min_x and max_y >= min_y:
            # Add padding
            min_x = max(0, min_x - padding)
            min_y = max(0, min_y - padding)
            max_x = min(width, max_x + padding)
            max_y = min(height, max_y + padding)
            
            cropped_img = img.crop((min_x, min_y, max_x, max_y))
            cropped_img.save(image_path, "PNG")
            print(f"Successfully cropped image: {cropped_img.width}x{cropped_img.height}")
            return True
        else:
            print("No content found to crop.")
            return False
    except Exception as e:
        print(f"Error cropping image: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python crop_image.py <image_path>")
        sys.exit(1)
    
    target_path = sys.argv[1]
    success = crop_robust(target_path)
    sys.exit(0 if success else 1)
