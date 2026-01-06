#!/usr/bin/env python3
"""
Generate app icons for ParallelChat
Creates PNG icons for all platforms and ICO for Windows
"""

import os
from PIL import Image, ImageDraw

# Icon sizes needed
SIZES = [16, 32, 48, 64, 128, 256, 512, 1024]

def create_icon(size):
    """Create the ParallelChat icon at specified size"""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Scale factor
    s = size / 512
    
    # Background gradient (simplified as solid purple)
    # Draw rounded rectangle background
    margin = int(20 * s)
    corner_radius = int(100 * s)
    
    # Background color (gradient approximation)
    bg_color = (106, 90, 205)  # Purple blend
    
    # Draw rounded rectangle
    draw.rounded_rectangle(
        [0, 0, size-1, size-1],
        radius=corner_radius,
        fill=bg_color
    )
    
    # Panel positions and colors
    panels = [
        # (x, y, color) - ChatGPT green, Gemini blue, Claude orange, Grok blue
        (60, 60, (16, 163, 127)),      # Top-left - ChatGPT green
        (272, 60, (66, 133, 244)),     # Top-right - Gemini blue
        (60, 272, (217, 119, 6)),      # Bottom-left - Claude orange
        (272, 272, (29, 161, 242)),    # Bottom-right - Grok blue
    ]
    
    panel_size = int(180 * s)
    panel_radius = int(20 * s)
    
    for px, py, color in panels:
        x = int(px * s)
        y = int(py * s)
        
        # Draw panel
        draw.rounded_rectangle(
            [x, y, x + panel_size, y + panel_size],
            radius=panel_radius,
            fill=color
        )
        
        # Draw avatar circle
        avatar_r = int(25 * s)
        avatar_cx = x + panel_size // 2
        avatar_cy = y + int(60 * s)
        draw.ellipse(
            [avatar_cx - avatar_r, avatar_cy - avatar_r, 
             avatar_cx + avatar_r, avatar_cy + avatar_r],
            fill=(255, 255, 255, 230)
        )
        
        # Draw text lines
        line_h = int(12 * s)
        line_y = y + int(100 * s)
        line_x = x + int(40 * s)
        
        # First line
        draw.rounded_rectangle(
            [line_x, line_y, line_x + int(100 * s), line_y + line_h],
            radius=int(6 * s),
            fill=(255, 255, 255, 150)
        )
        
        # Second line
        line_y2 = line_y + int(25 * s)
        draw.rounded_rectangle(
            [line_x, line_y2, line_x + int(70 * s), line_y2 + line_h],
            radius=int(6 * s),
            fill=(255, 255, 255, 100)
        )
    
    # Draw connection lines
    line_color = (255, 255, 255, 128)
    line_width = max(1, int(4 * s))
    
    # Horizontal lines
    draw.line([(int(240 * s), int(150 * s)), (int(272 * s), int(150 * s))], 
              fill=line_color, width=line_width)
    draw.line([(int(240 * s), int(362 * s)), (int(272 * s), int(362 * s))], 
              fill=line_color, width=line_width)
    
    # Vertical lines
    draw.line([(int(150 * s), int(240 * s)), (int(150 * s), int(272 * s))], 
              fill=line_color, width=line_width)
    draw.line([(int(362 * s), int(240 * s)), (int(362 * s), int(272 * s))], 
              fill=line_color, width=line_width)
    
    return img

def main():
    # Get script directory and project root
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    # Create build/icons directory
    build_dir = os.path.join(project_root, 'build')
    icons_dir = os.path.join(build_dir, 'icons')
    os.makedirs(icons_dir, exist_ok=True)
    
    # Generate PNG icons at all sizes
    images = []
    for size in SIZES:
        img = create_icon(size)
        
        # Save individual PNG
        png_path = os.path.join(icons_dir, f'{size}x{size}.png')
        img.save(png_path, 'PNG')
        print(f'Created: {png_path}')
        
        images.append(img)
    
    # Create icon.png (512x512) for general use
    icon_512 = create_icon(512)
    icon_512.save(os.path.join(build_dir, 'icon.png'), 'PNG')
    print(f'Created: {os.path.join(build_dir, "icon.png")}')
    
    # Create icon.ico for Windows (multiple sizes embedded)
    ico_sizes = [16, 32, 48, 64, 128, 256]
    ico_images = [create_icon(s) for s in ico_sizes]
    ico_path = os.path.join(build_dir, 'icon.ico')
    ico_images[0].save(ico_path, format='ICO', sizes=[(s, s) for s in ico_sizes], 
                       append_images=ico_images[1:])
    print(f'Created: {ico_path}')
    
    # Also copy 512x512 as the main icon for public folder
    public_dir = os.path.join(project_root, 'public')
    icon_512.save(os.path.join(public_dir, 'logo.png'), 'PNG')
    print(f'Created: {os.path.join(public_dir, "logo.png")}')
    
    print('\nAll icons generated successfully!')
    print(f'\nFor macOS .icns file, run on a Mac:')
    print(f'  cd {build_dir}')
    print(f'  mkdir icon.iconset')
    print(f'  cp icons/16x16.png icon.iconset/icon_16x16.png')
    print(f'  cp icons/32x32.png icon.iconset/icon_16x16@2x.png')
    print(f'  cp icons/32x32.png icon.iconset/icon_32x32.png')
    print(f'  cp icons/64x64.png icon.iconset/icon_32x32@2x.png')
    print(f'  cp icons/128x128.png icon.iconset/icon_128x128.png')
    print(f'  cp icons/256x256.png icon.iconset/icon_128x128@2x.png')
    print(f'  cp icons/256x256.png icon.iconset/icon_256x256.png')
    print(f'  cp icons/512x512.png icon.iconset/icon_256x256@2x.png')
    print(f'  cp icons/512x512.png icon.iconset/icon_512x512.png')
    print(f'  cp icons/1024x1024.png icon.iconset/icon_512x512@2x.png')
    print(f'  iconutil -c icns icon.iconset')

if __name__ == '__main__':
    main()




