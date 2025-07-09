# lessons/models.py

from django.db import models
from users.models import Teacher, Student

# 1. Course model
class Course(models.Model):
    name = models.CharField(max_length=255)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, related_name='courses')
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.name

# 2. Group model
class Group(models.Model):
    name = models.CharField(max_length=100)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='groups')
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, related_name='groups')
    students = models.ManyToManyField(Student, related_name='groups')

    def __str__(self):
        return self.name

# 3. CourseSchedule (weekly schedule for a group)
class CourseSchedule(models.Model):
    DAYS = [
        ('mon', 'Monday'),
        ('tue', 'Tuesday'),
        ('wed', 'Wednesday'),
        ('thu', 'Thursday'),
        ('fri', 'Friday'),
        ('sat', 'Saturday'),
        ('sun', 'Sunday'),
    ]

    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='schedules')
    day_of_week = models.CharField(max_length=3, choices=DAYS)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        unique_together = ('group', 'day_of_week', 'start_time', 'end_time')

    def __str__(self):
        return f"{self.group.name} - {self.get_day_of_week_display()}"

# 4. Holiday model (dam olish/bayram)
class Holiday(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='holidays')
    date = models.DateField()
    reason = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.course.name} - {self.date} ({self.reason})"

# 5. Lesson model (individual session)
class Lesson(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    created_by = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.title} - {self.group.name} ({self.date})"

# 6. Attendance model
class Attendance(models.Model):
    STATUS_CHOICES = [
        ('present', "Keldi"),
        ('absent', "Kelmadi"),
        ('excused', "Sababli qoldi"),
    ]

    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='attendances')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendances')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    feedback = models.TextField(blank=True)  # Alohida izoh

    class Meta:
        unique_together = ('lesson', 'student')

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.lesson.title}"

# 7. Grade model (optional, separate feedback style)
class Grade(models.Model):
    CHOICES = [
        ('excellent', "Yaxshi"),
        ('average', "O'rtacha"),
        ('bad', "Yomon"),
    ]

    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='grades')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='grades')
    grade = models.CharField(max_length=10, choices=CHOICES)
    comment = models.TextField(blank=True)

    class Meta:
        unique_together = ('lesson', 'student')

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.get_grade_display()}"
