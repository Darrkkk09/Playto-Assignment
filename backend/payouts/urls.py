from django.urls import path
from . import views

urlpatterns = [
    path('merchants/<int:merchant_id>/balance/', views.MerchantBalanceView.as_view(), name='merchant-balance'),
    path('merchants/<int:merchant_id>/payouts/', views.PayoutListCreateView.as_view(), name='payout-list-create'),
    path('merchants/<int:merchant_id>/transactions/', views.MerchantTransactionsView.as_view(), name='merchant-transactions'),
]
