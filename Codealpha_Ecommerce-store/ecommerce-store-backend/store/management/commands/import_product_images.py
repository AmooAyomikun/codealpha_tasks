import json
import os
from django.core.management.base import BaseCommand
from django.core.files import File
from store.models import Product

class Command(BaseCommand):
    help = 'Attach real image files to products based on products.json'

    def add_arguments(self, parser):
        parser.add_argument('json_path', type=str)
        parser.add_argument('images_dir', type=str)

    def handle(self, *args, **options):
        json_path = options['json_path']
        images_dir = options['images_dir']

        with open(json_path, 'r', encoding='utf-8') as f:
            products_data = json.load(f)

        matched = 0
        missing = 0

        for item in products_data:
            image_filename = item.get('image')
            product_name = item.get('name')

            if not image_filename or not product_name:
                continue

            image_path = os.path.join(images_dir, image_filename)

            try:
                product = Product.objects.get(name=product_name)
            except Product.DoesNotExist:
                continue

            if os.path.exists(image_path):
                with open(image_path, 'rb') as img_file:
                    product.image.save(image_filename, File(img_file), save=True)
                matched += 1
            else:
                self.stdout.write(self.style.WARNING(f'Missing file: {image_filename}'))
                missing += 1

        self.stdout.write(self.style.SUCCESS(f'Done. Attached {matched} images, {missing} missing.'))