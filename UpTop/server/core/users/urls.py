from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserCreateViewSet, check_username, StudentViewSet, TeacherViewSet, login, UserViewSet

router = DefaultRouter()
router.register(r'users', UserCreateViewSet, basename='user')
router.register(r'all-users', UserViewSet, basename='all-users')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'teachers', TeacherViewSet, basename='teacher')

urlpatterns = [
    path('login/', login, name='login'),
    path('check-username/', check_username),
    path('', include(router.urls)),
]