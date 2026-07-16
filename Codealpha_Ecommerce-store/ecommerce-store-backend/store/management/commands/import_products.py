import json
from django.core.management.base import BaseCommand
from store.models import Product

class Command(BaseCommand):
    help = 'Import products from the frontend products.json file'

    def add_arguments(self, parser):
        parser.add_argument('json_path', type=str, help='Path to products.json')

    def handle(self, *args, **options):
        json_path = options['json_path']

        with open(json_path, 'r', encoding='utf-8') as f:
            products_data = json.load(f)

        created_count = 0
        updated_count = 0

        for item in products_data:
            product, created = Product.objects.update_or_create(
                name=item.get('name'),
                defaults={
                    'description': item.get('description', ''),
                    'price': item.get('price', 0),
                    'original_price': item.get('originalPrice'),
                    'stock_quantity': item.get('stock', item.get('stock_quantity', 10)),
                    'category': item.get('category', ''),
                    'brand': item.get('brand', 'Nexara'),
                    'rating': item.get('rating', 4.5),
                    'review_count': item.get('reviewCount', 0),
                    'featured': item.get('featured', False),
                    'badge': item.get('badge'),
                }
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(self.style.SUCCESS(
            f'Done. Created {created_count} products, updated {updated_count} products.'
        ))