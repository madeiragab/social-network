from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, PostMediaViewSet

router = DefaultRouter()
router.register(r'', PostViewSet, basename='post')
router.register(r'media', PostMediaViewSet, basename='post-media')

urlpatterns = [
    path('', include(router.urls)),
]
