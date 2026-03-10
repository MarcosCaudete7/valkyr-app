from PIL import Image

def crop_only(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    bbox = img.getbbox()
    if bbox:
        print(f"Cropping to bbox: {bbox}")
        img = img.crop(bbox)
        img.save(output_path)
        print(f"Saved cropped logo to {output_path}")

crop_only('/home/marcos/Documentos/GitHub/valkyr-app/front_end/public/valkyr_logo_full_transparent.png', '/home/marcos/Documentos/GitHub/valkyr-app/front_end/public/valkyr_logo_full_transparent.png')
