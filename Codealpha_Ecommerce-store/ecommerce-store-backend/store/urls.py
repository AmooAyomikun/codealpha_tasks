from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('api/auth/register/', views.register, name='api_register'),
    path('api/auth/login/', views.login_view, name='api_login'),
    path('api/auth/logout/', views.logout_view, name='api_logout'),
    
    # Products
    path('api/products/', views.api_product_list, name='api_product_list'),
    path('api/products/<int:pk>/', views.api_product_detail, name='api_product_detail'),
    
    # Cart
    path('api/cart/', views.api_cart, name='api_cart'),
    path('api/cart/add/', views.api_cart_add, name='api_cart_add'),
    path('api/cart/remove/<int:pk>/', views.api_cart_remove, name='api_cart_remove'),
    path('api/cart/update/<int:pk>/', views.api_cart_update, name='api_cart_update'),
    
    # Wishlist
    path('api/wishlist/', views.api_wishlist, name='api_wishlist'),
    path('api/wishlist/toggle/<int:pk>/', views.api_wishlist_toggle, name='api_wishlist_toggle'),
    
    # Reviews
    path('api/reviews/', views.api_reviews, name='api_reviews'),
    
    # Coupons
    path('api/coupons/validate/', views.api_coupon_validate, name='api_coupon_validate'),
    
    # Orders
    path('api/orders/', views.api_orders, name='api_orders'),
    path('api/orders/<int:pk>/', views.api_order_detail, name='api_order_detail'),

    # Profile
    path('api/auth/profile/', views.api_profile, name='api_profile'),
]

from rest_framework.routers import DefaultRouter
router = DefaultRouter()
router.register(r'api/addresses', views.AddressViewSet, basename='address')
router.register(r'api/payment-methods', views.PaymentMethodViewSet, basename='paymentmethod')

urlpatterns += router.urls