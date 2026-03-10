import sys
from rembg import remove
from PIL import Image

def main():
    if len(sys.argv) != 3:
        print("Usage: script.py <input> <output>")
        return
        
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    
    try:
        print(f"Loading image {input_path}...")
        input_image = Image.open(input_path)
        
        print("Removing background using rembg AI...")
        # remove() automatically detects the main subject and makes the rest transparent
        output_image = remove(input_image)
        
        print(f"Saving to {output_path}...")
        output_image.save(output_path)
        print("DONE")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
