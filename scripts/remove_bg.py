
from PIL import Image
import sys

def remove_black_background(input_path, output_path, tolerance=30):
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()
        
        newData = []
        for item in datas:
            # Check if pixel is close to black (within tolerance)
            if item[0] < tolerance and item[1] < tolerance and item[2] < tolerance:
                newData.append((0, 0, 0, 0))  # Transparent
            else:
                newData.append(item)
        
        img.putdata(newData)
        img.save(output_path, "PNG")
        print(f"Successfully processed {input_path} -> {output_path}")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    input_file = "public/logo.png"
    output_file = "public/logo-nobg.png"
    remove_black_background(input_file, output_file)
