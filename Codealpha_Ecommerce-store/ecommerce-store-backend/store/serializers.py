from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Product, Order, OrderItem, Cart, CartItem, Wishlist, Review, Coupon, Address, PaymentMethod

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.first_name', read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'user_name', 'rating', 'comment', 'verified_purchase', 'created_at']

class ProductSerializer(serializers.ModelSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)
    inStock = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    bundle_items = serializers.SerializerMethodField()
    bundle_discount = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'

    def get_rating(self, obj):
        from django.db.models import Avg
        avg = obj.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else float(obj.rating)

    def get_review_count(self, obj):
        count = obj.reviews.count()
        return count if count > 0 else obj.review_count

    def get_inStock(self, obj):
        return obj.stock_quantity > 0

    def get_image(self, obj):
        if obj.image:
            filename = obj.image.name.split('/')[-1]
            return f'../static/images/{filename}'
        return None

    def get_bundle_items(self, obj):
        products = Product.objects.filter(stock_quantity__gt=0).exclude(id=obj.id)
        items = []
        
        accessories = products.filter(category='accessories')
        audio = products.filter(category='audio')
        wearables = products.filter(category='wearables')
        phones = products.filter(category='phones')
        gaming = products.filter(category='gaming')

        brand = (obj.brand or '').lower()
        cat = obj.category
        
        if cat == 'phones':
            if brand == 'apple':
                mag = products.filter(id=48).first() or accessories.first()
                air = products.filter(id=10).first() or audio.first()
                if mag: items.append(mag)
                if air: items.append(air)
            elif brand == 'samsung':
                pbank = products.filter(id=46).first() or accessories.first()
                gwatch = products.filter(id__in=[14, 29, 27]).first() or wearables.first() or audio.first()
                if pbank: items.append(pbank)
                if gwatch: items.append(gwatch)
            else:
                if accessories.first(): items.append(accessories.first())
                if audio.first(): items.append(audio.first())
        elif cat == 'laptops':
            hub = products.filter(id=50).first() or accessories.first()
            pbank = products.filter(id=47).first() or accessories.exclude(id=hub.id if hub else 0).first()
            if hub: items.append(hub)
            if pbank: items.append(pbank)
        elif cat == 'audio':
            pbank = products.filter(id=46).first() or accessories.first()
            phone = phones.first() or wearables.first()
            if pbank: items.append(pbank)
            if phone: items.append(phone)
        elif cat == 'wearables':
            stn = products.filter(id=49).first() or accessories.first()
            ear = audio.first() or phones.first()
            if stn: items.append(stn)
            if ear: items.append(ear)
        elif cat == 'gaming':
            ctrl = products.filter(id__in=[42, 43]).first() or gaming.first()
            head = products.filter(id=44).first() or audio.first()
            if ctrl: items.append(ctrl)
            if head: items.append(head)
        elif cat == 'tvs':
            spk = products.filter(id=59).first() or audio.first()
            ps5 = products.filter(id=39).first() or gaming.first()
            if spk: items.append(spk)
            if ps5: items.append(ps5)
        else:
            if accessories.first(): items.append(accessories.first())
            if audio.first(): items.append(audio.first())

        res = []
        for i in items[:2]:
            image_url = None
            if i.image:
                filename = i.image.name.split('/')[-1]
                image_url = f'../static/images/{filename}'
            res.append({
                'id': i.id,
                'name': i.name,
                'price': i.price,
                'image': image_url
            })
        return res

    def get_bundle_discount(self, obj):
        return 45000

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total']

    def get_total(self, obj):
        return sum(item.product.price * item.quantity for item in obj.items.all())

class WishlistSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'products']

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'price', 'quantity', 'subtotal']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'created_at', 'full_name', 'address', 'phone', 
            'delivery_state', 'payment_method', 'status', 'items', 'total'
        ]

    def get_total(self, obj):
        return obj.total()

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ['code', 'discount_percent', 'discount_amount', 'active', 'expiry_date']

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'street', 'city', 'state', 'postal_code', 'country', 'is_default']

class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ['id', 'card_type', 'last4', 'exp_month', 'exp_year', 'is_default']
