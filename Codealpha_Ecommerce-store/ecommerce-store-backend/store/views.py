from django.shortcuts import render, get_object_or_404, redirect
from .models import Product, Order, OrderItem
from decimal import Decimal
from django.contrib.auth import login, logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serialiazer import ProductSerializer

# Create your views here.
def product_list(request):
    products = Product.objects.all()
    return render(request, 'store/product_list.html', {'products': products})

def product_detail(request, pk):
    product = get_object_or_404(Product, pk=pk)
    return render(request, 'store/product_detail.html', {'product': product})

def cart_add(request, pk):
    cart = request.session.get('cart', {})
    pk = str(pk)  
    cart[pk] = cart.get(pk, 0) + 1
    request.session['cart'] = cart
    return redirect('cart_detail')

def cart_remove(request, pk):
    cart = request.session.get('cart', {})
    pk = str(pk)
    if pk in cart:
        del cart[pk]
        request.session['cart'] = cart
    return redirect('cart_detail')

def cart_detail(request):
    cart = request.session.get('cart', {})
    items = []
    total = Decimal('0')

    for pk, qty in cart.items():
        product = get_object_or_404(Product, pk=pk)
        subtotal = product.price * qty
        total += subtotal
        items.append({'product': product, 'quantity': qty, 'subtotal': subtotal})

    return render(request, 'store/cart_detail.html', {'items': items, 'total': total})

def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('product_list')
    else:
        form = UserCreationForm()
    return render(request, 'store/register.html', {'form': form})

@login_required
def my_orders(request):
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    return render(request, 'store/my_orders.html', {'orders': orders})

def checkout(request):
    cart = request.session.get('cart', {})
    if not cart:
        return redirect('cart_detail')

    if request.method == 'POST':
        order = Order.objects.create(
            user=request.user,
            full_name=request.POST['full_name'],
            address=request.POST['address'],
            phone=request.POST['phone'],
        )
        for pk, qty in cart.items():
            product = get_object_or_404(Product, pk=pk)
            OrderItem.objects.create(order=order, product=product, price=product.price, quantity=qty)
            product.stock_quantity -= qty
            product.save()

        request.session['cart'] = {}
        return redirect('order_confirmation', order_id=order.pk)

    return render(request, 'store/checkout.html', {'cart': cart})

def order_confirmation(request, order_id):
    order = get_object_or_404(Order, pk=order_id, user=request.user)
    return render(request, 'store/order_confirmation.html', {'order': order})

@api_view(['GET'])
def api_product_list(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True, context={'request': request})
    return Response(serializer.data)

