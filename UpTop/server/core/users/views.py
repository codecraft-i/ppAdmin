from django.shortcuts import render
from rest_framework import viewsets, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAdminUser
from django.contrib.auth import authenticate
from django.db.models import Q
from datetime import date, timedelta
from django.views.decorators.csrf import csrf_exempt
from dateutil.relativedelta import relativedelta

from .models import User, Student, Teacher
from .serializers import UserCreateSerializer, StudentSerializer, TeacherSerializer, UserInfoSerializer, UserUpdateSerializer

@api_view(['POST'])
@csrf_exempt
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Username and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(username=username, password=password)
    
    if user is None:
        return Response(
            {'error': 'Invalid username or password'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if not (user.is_active and user.is_staff and user.is_superuser):
        return Response(
            {'error': 'User does not have admin privileges'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    token, created = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'user': {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
        }
    })

class UserCreateViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [AllowAny]

class UserViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]

    def list(self, request):
        search = request.query_params.get("search", "")
        min_age = request.query_params.get("min_age")
        max_age = request.query_params.get("max_age")

        users = User.objects.all()

        if search:
            users = users.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(username__icontains=search)
            )

        if min_age or max_age:
            today = date.today()
            if min_age:
                max_birthdate = today - relativedelta(years=int(min_age))
                users = users.filter(birth_date__lte=max_birthdate)
            if max_age:
                min_birthdate = today - relativedelta(years=int(max_age))
                users = users.filter(birth_date__gte=min_birthdate)

        serializer = UserInfoSerializer(users, many=True)
        return Response({
            "count": User.objects.count(),
            "filtered_count": users.count(),
            "results": serializer.data
        })

    def retrieve(self, request, pk=None):
        try:
            user = User.objects.get(username=pk)
            serializer = UserInfoSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(
                {"error": "Foydalanuvchi topilmadi"},
                status=status.HTTP_404_NOT_FOUND
            )

    def update(self, request, pk=None):
        try:
            user = User.objects.get(username=pk)
            serializer = UserUpdateSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response(
                {"error": "Foydalanuvchi topilmadi"},
                status=status.HTTP_404_NOT_FOUND
            )

@api_view(['POST'])
@permission_classes([IsAdminUser])
def reset_password(request, username):
    try:
        user = User.objects.get(username=username)
        password = request.data.get('password')
        if not password:
            return Response(
                {"error": "Parol kiritilishi shart"},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.set_password(password)
        user.save()
        return Response({"message": "Parol muvaffaqiyatli o'zgartirildi"})
    except User.DoesNotExist:
        return Response(
            {"error": "Foydalanuvchi topilmadi"},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
def check_username(request):
    username = request.GET.get('username', '')
    exists = User.objects.filter(username=username).exists()
    return Response({'exists': exists})

class StudentViewSet(viewsets.ViewSet):
    def list(self, request):
        search = request.query_params.get("search", "")
        min_age = request.query_params.get("min_age")
        max_age = request.query_params.get("max_age")

        students = Student.objects.select_related("user")

        if search:
            students = students.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(user__username__icontains=search)
            )

        if min_age or max_age:
            today = date.today()
            if min_age:
                max_birthdate = today - relativedelta(years=int(min_age))
                students = students.filter(user__birth_date__lte=max_birthdate)
            if max_age:
                min_birthdate = today - relativedelta(years=int(max_age))
                students = students.filter(user__birth_date__gte=min_birthdate)

        serializer = StudentSerializer(students, many=True)
        return Response({
            "count": Student.objects.count(),
            "filtered_count": students.count(),
            "results": serializer.data
        })

class TeacherViewSet(viewsets.ViewSet):
    def list(self, request):
        search = request.query_params.get("search", "")
        min_age = request.query_params.get("min_age")
        max_age = request.query_params.get("max_age")

        teachers = Teacher.objects.select_related("user")

        if search:
            teachers = teachers.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(user__username__icontains=search)
            )

        if min_age or max_age:
            today = date.today()
            if min_age:
                max_birthdate = today - relativedelta(years=int(min_age))
                teachers = teachers.filter(user__birth_date__lte=max_birthdate)
            if max_age:
                min_birthdate = today - relativedelta(years=int(max_age))
                teachers = teachers.filter(user__birth_date__gte=min_birthdate)

        serializer = TeacherSerializer(teachers, many=True)
        return Response({
            "count": Teacher.objects.count(),
            "filtered_count": teachers.count(),
            "results": serializer.data
        })                                          