from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, Workspace, WorkspaceMember, Project, Column, TaskLabel, Task,
    Subtask, TaskDependency, Comment, Attachment, ActivityLogEntry, Notification
)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff')
    search_fields = ('username', 'email')
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('avatar_url',)}),
    )

@admin.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner')
    search_fields = ('name', 'owner__username', 'owner__email')

@admin.register(WorkspaceMember)
class WorkspaceMemberAdmin(admin.ModelAdmin):
    list_display = ('workspace', 'user', 'role')
    list_filter = ('role', 'workspace')
    search_fields = ('user__username', 'user__email', 'workspace__name')

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'workspace', 'created_at', 'archived')
    list_filter = ('archived', 'workspace')
    search_fields = ('name', 'workspace__name')

@admin.register(Column)
class ColumnAdmin(admin.ModelAdmin):
    list_display = ('name', 'project', 'order')
    list_filter = ('project',)
    search_fields = ('name', 'project__name')
    ordering = ('project', 'order')

@admin.register(TaskLabel)
class TaskLabelAdmin(admin.ModelAdmin):
    list_display = ('name', 'project', 'color')
    list_filter = ('project',)
    search_fields = ('name',)

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'project_name', 'column', 'priority', 'due_date', 'created_by')
    list_filter = ('priority', 'archived', 'column__project')
    search_fields = ('title', 'description', 'created_by__username', 'created_by__email')
    ordering = ('column', 'order')

    def project_name(self, obj):
        return obj.column.project.name
    project_name.short_description = 'Project'

@admin.register(Subtask)
class SubtaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'task', 'is_complete', 'order')
    list_filter = ('is_complete', 'task__column__project')
    search_fields = ('title', 'task__title')

@admin.register(TaskDependency)
class TaskDependencyAdmin(admin.ModelAdmin):
    list_display = ('task', 'blocked_by_task')
    search_fields = ('task__title', 'blocked_by_task__title')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('task', 'user', 'created_at')
    list_filter = ('created_at', 'task__column__project')
    search_fields = ('body', 'user__username', 'user__email', 'task__title')

@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ('filename', 'task', 'uploaded_by', 'uploaded_at')
    list_filter = ('uploaded_at',)
    search_fields = ('filename', 'task__title', 'uploaded_by__username')

@admin.register(ActivityLogEntry)
class ActivityLogEntryAdmin(admin.ModelAdmin):
    list_display = ('action_type', 'task', 'project', 'user', 'created_at')
    list_filter = ('action_type', 'created_at', 'project')
    search_fields = ('description', 'user__username', 'task__title', 'project__name')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'read', 'created_at')
    list_filter = ('type', 'read', 'created_at')
    search_fields = ('body', 'user__username', 'user__email')
