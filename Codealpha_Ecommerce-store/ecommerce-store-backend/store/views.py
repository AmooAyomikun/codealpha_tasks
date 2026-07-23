from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import Product, Order, OrderItem, Cart, CartItem, Wishlist, Review, Coupon
from .serializers import (
    ProductSerializer, OrderSerializer, CartSerializer, 
    WishlistSerializer, ReviewSerializer, CouponSerializer,
    UserSerializer, CartItemSerializer
)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    if not username or not password:
        return Response({'error': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
    user = User.objects.create_user(username=username, password=password, email=email)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key, 'user': UserSerializer(user).data}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': UserSerializer(user).data})
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    if hasattr(request.user, 'auth_token'):
        request.user.auth_token.delete()
    return Response({'message': 'Logged out'}, status=status.HTTP_200_OK)

# Products
@api_view(['GET'])
@permission_classes([AllowAny])
def api_product_list(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def api_product_detail(request, pk):
    product = get_object_or_404(Product, pk=pk)
    serializer = ProductSerializer(product, context={'request': request})
    return Response(serializer.data)

# Cart
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_cart(request):
    cart, _ = Cart.objects.get_or_create(user=request.user)
    serializer = CartSerializer(cart, context={'request': request})
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_cart_add(request):
    cart, _ = Cart.objects.get_or_create(user=request.user)
    product_id = request.data.get('product_id')
    quantity = int(request.data.get('quantity', 1))
    product = get_object_or_404(Product, pk=product_id)
    
    cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
    if not created:
        cart_item.quantity += quantity
    else:
        cart_item.quantity = quantity
    cart_item.save()
    
    return Response(CartSerializer(cart, context={'request': request}).data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def api_cart_update(request, pk):
    cart = get_object_or_404(Cart, user=request.user)
    cart_item = get_object_or_404(CartItem, cart=cart, product_id=pk)
    
    quantity = request.data.get('quantity')
    if quantity is not None:
        cart_item.quantity = int(quantity)
        cart_item.save()
        
    return Response(CartSerializer(cart, context={'request': request}).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_cart_remove(request, pk):
    cart = get_object_or_404(Cart, user=request.user)
    cart_item = get_object_or_404(CartItem, cart=cart, product_id=pk)
    cart_item.delete()
    return Response(CartSerializer(cart, context={'request': request}).data)

# Wishlist
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def api_wishlist(request):
    wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
    
    if request.method == 'GET':
        serializer = WishlistSerializer(wishlist, context={'request': request})
        return Response(serializer.data)
        
    if request.method == 'POST':
        product_id = request.data.get('product_id')
        action = request.data.get('action') # 'add' or 'remove'
        product = get_object_or_404(Product, pk=product_id)
        
        if action == 'add':
            wishlist.products.add(product)
        elif action == 'remove':
            wishlist.products.remove(product)
            
        return Response(WishlistSerializer(wishlist, context={'request': request}).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_wishlist_toggle(request, pk):
    wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
    product = get_object_or_404(Product, pk=pk)
    
    if product in wishlist.products.all():
        wishlist.products.remove(product)
        action = 'removed'
    else:
        wishlist.products.add(product)
        action = 'added'
        
    return Response({
        'action': action,
        'wishlist': WishlistSerializer(wishlist, context={'request': request}).data
    })

# Reviews
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def api_reviews(request):
    if request.method == 'GET':
        product_id = request.query_params.get('product')
        if product_id:
            reviews = Review.objects.filter(product_id=product_id)
        else:
            reviews = Review.objects.all()
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)
        
    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
            
        product_id = request.data.get('product_id')
        product = get_object_or_404(Product, pk=product_id)
        
        has_delivered = OrderItem.objects.filter(
            order__user=request.user, 
            order__status='delivered', 
            product=product
        ).exists()
        
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, product=product, verified_purchase=has_delivered)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Orders
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def api_orders(request):
    if request.method == 'GET':
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        serializer = OrderSerializer(orders, many=True, context={'request': request})
        return Response(serializer.data)
        
    if request.method == 'POST':
        cart = get_object_or_404(Cart, user=request.user)
        if not cart.items.exists():
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
            
        data = request.data
        order = Order.objects.create(
            user=request.user,
            full_name=data.get('full_name'),
            address=data.get('address'),
            phone=data.get('phone'),
            delivery_state=data.get('delivery_state', ''),
            payment_method=data.get('payment_method', 'card'),
        )
        
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                price=cart_item.product.price,
                quantity=cart_item.quantity
            )
            cart_item.product.stock_quantity -= cart_item.quantity
            cart_item.product.save()
            
        cart.items.all().delete()
        return Response(OrderSerializer(order, context={'request': request}).data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_order_detail(request, pk):
    order = get_object_or_404(Order, pk=pk, user=request.user)
    serializer = OrderSerializer(order, context={'request': request})
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def api_coupon_validate(request):
    from django.utils import timezone
    code = request.data.get('code')
    coupon = Coupon.objects.filter(code=code, active=True).first()
    if coupon:
        if coupon.expiry_date and coupon.expiry_date < timezone.now():
            return Response({'error': 'Coupon has expired'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = CouponSerializer(coupon)
        return Response(serializer.data)
    return Response({'error': 'Invalid or expired coupon'}, status=status.HTTP_400_BAD_REQUEST)

# Profile
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def api_profile(request):
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    elif request.method == 'PUT':
        user = request.user
        data = request.data
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.email = data.get('email', user.email)
        user.save()
        return Response(UserSerializer(user).data)

# Addresses
from .models import Address, PaymentMethod
from .serializers import AddressSerializer, PaymentMethodSerializer

class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        if serializer.validated_data.get('is_default'):
            Address.objects.filter(user=self.request.user).update(is_default=False)
        serializer.save(user=self.request.user)
        
    def perform_update(self, serializer):
        if serializer.validated_data.get('is_default'):
            Address.objects.filter(user=self.request.user).update(is_default=False)
        serializer.save()

# Payment Methods
class PaymentMethodViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PaymentMethod.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        if serializer.validated_data.get('is_default'):
            PaymentMethod.objects.filter(user=self.request.user).update(is_default=False)
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        if serializer.validated_data.get('is_default'):
            PaymentMethod.objects.filter(user=self.request.user).update(is_default=False)
        serializer.save()
