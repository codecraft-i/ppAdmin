from django.contrib import admin
from .models import Course, Group, CourseSchedule, Holiday, Lesson, Attendance, Grade

# Inline uchun CourseSchedule
class CourseScheduleInline(admin.TabularInline):
    model = CourseSchedule
    extra = 1

# Course admini
@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('name', 'teacher', 'start_date', 'end_date')
    list_filter = ('teacher', 'start_date')
    search_fields = ('name', 'teacher__user__first_name', 'teacher__user__last_name')

# Group admini
@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'course', 'teacher')
    list_filter = ('course', 'teacher')
    search_fields = ('name', 'course__name', 'teacher__user__first_name')
    filter_horizontal = ('students',)
    inlines = [CourseScheduleInline]

# Holiday admini
@admin.register(Holiday)
class HolidayAdmin(admin.ModelAdmin):
    list_display = ('course', 'date', 'reason')
    list_filter = ('course', 'date')
    search_fields = ('reason',)

# Attendance inlines (Lesson ichida)
class AttendanceInline(admin.TabularInline):
    model = Attendance
    extra = 0

# Grade inlines (Lesson ichida)
class GradeInline(admin.TabularInline):
    model = Grade
    extra = 0

# Lesson admini
@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'group', 'date', 'start_time', 'end_time', 'created_by')
    list_filter = ('group', 'date')
    search_fields = ('title', 'group__name', 'created_by__user__first_name')
    inlines = [AttendanceInline, GradeInline]

# Optional: separate admin for Attendance if needed
@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('lesson', 'student', 'status')
    list_filter = ('status', 'lesson__date', 'lesson__group')
    search_fields = ('student__user__first_name', 'student__user__last_name')

# Optional: separate admin for Grade if needed
@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ('lesson', 'student', 'grade')
    list_filter = ('grade', 'lesson__group')
    search_fields = ('student__user__first_name', 'student__user__last_name')