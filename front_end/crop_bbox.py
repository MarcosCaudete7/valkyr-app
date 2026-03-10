from PIL import Image

def crop_and_square(input_path, output_path):
    # Load the image
    img = Image.open(input_path).convert("RGBA")
    
    # Get the bounding box of the non-zero alpha pixels
    bbox = img.getbbox()
    if bbox:
        print(f"Cropping to bbox: {bbox}")
        img = img.crop(bbox)
        
    width, height = img.size
    print(f"Cropped size: {width}x{height}")
    
    # We want a perfect square with a bit of padding (e.g., 5%)
    max_dim = max(width, height)
    pad = int(max_dim * 0.05)
    new_size = max_dim + 2 * pad
    
    # Create a new transparent image
    new_img = Image.new("RGBA", (new_size, new_size), (0, 0, 0, 0))
    
    # Paste the cropped image in the center
    paste_x = (new_size - width) // 2
    paste_y = (new_size - height) // 2
    new_img.paste(img, (paste_x, paste_y))
    
    # Resize exactly to 512x512 for standard icon/favicon
    new_img = new_img.resize((512, 512), Image.Resampling.LANCZOS)
    new_img.save(output_path)
    print(f"Saved perfectly centered and scaled logo to {output_path}")

crop_and_square('/home/marcos/Documentos/GitHub/valkyr-app/front_end/public/valkyr_logo_square_transparent.png', '/home/marcos/Documentos/GitHub/valkyr-app/front_end/public/favicon.png')
