import json
from store.models import Product

for p in Product.objects.all():
    name = p.name.lower()
    cat = p.category.lower() if p.category else ''

    specs = {}

    if 'phone' in cat or 'phone' in name:
        specs = {
            'Display': '6.1-inch or larger OLED',
            'Processor': 'Latest Gen Chipset',
            'RAM': '8GB or 12GB',
            'Storage': '128GB / 256GB / 512GB',
            'Camera': 'High-Res Multi-Lens Setup',
            'Battery': '4000mAh+',
            'OS': 'iOS or Android Latest'
        }
    elif 'laptop' in cat or 'macbook' in name:
        specs = {
            'Processor': 'Intel Core i7 / Apple M-Series',
            'RAM': '16GB or 32GB',
            'Storage': '512GB or 1TB NVMe SSD',
            'Display': '13-inch to 16-inch High-Res',
            'Battery Life': 'Up to 15 hours',
            'Weight': 'Under 2.5 kg'
        }
    elif 'audio' in cat or 'headphone' in name or 'earbud' in name:
        specs = {
            'Type': 'Wireless Noise-Canceling',
            'Battery Life': '20+ hours',
            'Connectivity': 'Bluetooth 5.0+',
            'Features': 'Active Noise Cancellation, Transparency Mode',
            'Water Resistance': 'IPX4 or higher'
        }
    elif 'wearable' in cat or 'watch' in name:
        specs = {
            'Display': 'AMOLED Touchscreen',
            'Battery Life': 'Up to 7 days',
            'Sensors': 'Heart Rate, SpO2, Sleep Tracking',
            'Water Resistance': '5 ATM / 50 meters',
            'Connectivity': 'Bluetooth, GPS'
        }
    elif 'tv' in cat or 'television' in name:
        specs = {
            'Resolution': '4K UHD (3840 x 2160)',
            'Display Tech': 'OLED / QLED / LED',
            'Refresh Rate': '120Hz',
            'Smart Features': 'Smart TV OS, Voice Control',
            'Ports': 'HDMI 2.1, USB, Ethernet'
        }
    elif 'gaming' in cat or 'console' in name or 'controller' in name:
        specs = {
            'Type': 'Gaming Console / Accessory',
            'Performance': 'High Frame Rate / 4K Gaming',
            'Storage': '1TB NVMe Custom SSD (if console)',
            'Connectivity': 'Wi-Fi 6, Gigabit Ethernet',
            'Controllers': 'Wireless with Haptic Feedback'
        }
    else:
        specs = {
            'Type': 'Premium Tech Accessory',
            'Material': 'High-quality durable build',
            'Compatibility': 'Universal / Model-specific',
            'Warranty': '1 Year Manufacturer Warranty'
        }

    # Fine-tuning for specific products based on keywords
    if 'iphone 15 pro' in name:
        specs['Processor'] = 'A17 Pro chip'
        specs['Material'] = 'Titanium with textured matte glass back'
        specs['Camera'] = '48MP Main | 12MP Ultra Wide | 12MP Telephoto'
    elif 's24 ultra' in name:
        specs['Processor'] = 'Snapdragon 8 Gen 3'
        specs['Material'] = 'Titanium Frame'
        specs['Camera'] = '200MP Main | 50MP Periscope | 12MP Ultra Wide'
    elif 'macbook pro' in name:
        specs['Processor'] = 'M3 Pro or M3 Max'
        specs['Display'] = 'Liquid Retina XDR display'
    
    p.specs = specs
    p.save()

print("Successfully updated product specifications.")
