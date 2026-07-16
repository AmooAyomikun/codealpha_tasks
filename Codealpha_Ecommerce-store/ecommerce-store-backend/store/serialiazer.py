from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    reviewCount = serializers.IntegerField(source='review_count')
    originalPrice = serializers.DecimalField(source='original_price', max_digits=10, decimal_places=2, allow_null=True, required=False)
    stock = serializers.IntegerField(source='stock_quantity')
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'originalPrice', 'stock',
                  'image', 'category', 'brand', 'rating', 'reviewCount', 'featured', 'badge']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None