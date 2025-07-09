from rest_framework import serializers
from .models import User, Student, Teacher

class UserInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'phone_number', 'birth_date', 'email', 'is_active', 'is_staff', 'is_superuser', 'is_student', 'is_teacher']

class UserCreateSerializer(serializers.ModelSerializer):
    bio = serializers.CharField(write_only=True, required=False, allow_blank=True)
    certificates = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'password', 'first_name', 'last_name',
            'phone_number', 'birth_date', 'is_student', 'is_teacher',
            'bio', 'certificates'
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Bu username allaqachon mavjud.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        is_student = validated_data.pop('is_student', False)
        is_teacher = validated_data.pop('is_teacher', False)
        bio = validated_data.pop('bio', '')
        certificates = validated_data.pop('certificates', '')

        user = User(**validated_data)
        user.set_password(password)

        if is_teacher:
            user.is_teacher = True
            user.is_student = False
        elif is_student:
            user.is_student = True
            user.is_teacher = False
        else:
            raise serializers.ValidationError("Role tanlanmagan: student yoki teacher bo'lishi kerak.")

        user.save()

        if user.is_teacher:
            Teacher.objects.create(user=user, bio=bio, certificates=certificates)
        elif user.is_student:
            Student.objects.create(user=user)

        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    bio = serializers.CharField(write_only=True, required=False, allow_blank=True)
    certificates = serializers.CharField(write_only=True, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    birth_date = serializers.DateField(required=False, allow_null=True)  # Ixtiyoriy va null bo'lishi mumkin
    email = serializers.EmailField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email',
            'phone_number', 'birth_date', 'is_active', 'is_staff',
            'is_superuser', 'is_student', 'is_teacher', 'bio',
            'certificates', 'password'
        ]
        extra_kwargs = {'username': {'read_only': True}}

    def validate(self, data):
        is_student = data.get('is_student', False)
        is_teacher = data.get('is_teacher', False)

        if is_teacher and is_student:
            raise serializers.ValidationError("Foydalanuvchi bir vaqtning o'zida talaba va o'qituvchi bo'la olmaydi.")

        return data

    def update(self, instance, validated_data):
        bio = validated_data.pop('bio', '')
        certificates = validated_data.pop('certificates', '')
        password = validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()

        if instance.is_teacher:
            teacher, created = Teacher.objects.get_or_create(user=instance)
            teacher.bio = bio
            teacher.certificates = certificates
            teacher.save()
            if instance.is_student:
                Student.objects.filter(user=instance).delete()
        elif instance.is_student:
            Student.objects.get_or_create(user=instance)
            if instance.is_teacher:
                Teacher.objects.filter(user=instance).delete()

        return instance

class StudentSerializer(serializers.ModelSerializer):
    user = UserInfoSerializer()

    class Meta:
        model = Student
        fields = ['id', 'user']

class TeacherSerializer(serializers.ModelSerializer):
    user = UserInfoSerializer()

    class Meta:
        model = Teacher
        fields = ['id', 'user']