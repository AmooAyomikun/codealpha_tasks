from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'avatar_url', 'created_at')
        read_only_fields = ('id', 'created_at')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

from .models import Workspace, WorkspaceMember, Project, Column, TaskLabel, Task, ActivityLogEntry

class WorkspaceMemberSerializer(serializers.ModelSerializer):
    user_detail = UserSerializer(source='user', read_only=True)

    class Meta:
        model = WorkspaceMember
        fields = ('id', 'workspace', 'user', 'user_detail', 'role')
        read_only_fields = ('id',)

class WorkspaceSerializer(serializers.ModelSerializer):
    memberships = WorkspaceMemberSerializer(many=True, read_only=True)

    class Meta:
        model = Workspace
        fields = ('id', 'name', 'owner', 'memberships')
        read_only_fields = ('id', 'owner')

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ('id', 'workspace', 'name', 'description', 'created_at', 'archived')
        read_only_fields = ('id', 'created_at')

class ColumnSerializer(serializers.ModelSerializer):
    class Meta:
        model = Column
        fields = ('id', 'project', 'name', 'order', 'color')
        read_only_fields = ('id',)

class TaskLabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskLabel
        fields = ('id', 'project', 'name', 'color')
        read_only_fields = ('id',)

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ('id', 'column', 'title', 'description', 'order', 'due_date', 'priority', 'created_by', 'created_at', 'archived', 'assignees', 'labels')
        read_only_fields = ('id', 'created_by', 'created_at')

    def validate(self, data):
        column = data.get('column')
        if not column and self.instance:
            column = self.instance.column

        if column and 'assignees' in data:
            workspace = column.project.workspace
            valid_user_ids = set(workspace.memberships.values_list('user_id', flat=True))
            for assignee in data['assignees']:
                if assignee.id not in valid_user_ids:
                    raise serializers.ValidationError({
                        "assignees": f"User {assignee.username} is not a member of the workspace."
                    })

        if column and 'labels' in data:
            project = column.project
            for label in data['labels']:
                if label.project_id != project.id:
                    raise serializers.ValidationError({
                        "labels": f"Label {label.name} does not belong to the project."
                    })

        if 'title' in data and not data['title'].strip():
            raise serializers.ValidationError({"title": "This field may not be blank."})

        return data

class ActivityLogEntrySerializer(serializers.ModelSerializer):
    user_detail = UserSerializer(source='user', read_only=True)

    class Meta:
        model = ActivityLogEntry
        fields = ('id', 'task', 'project', 'user', 'user_detail', 'action_type', 'description', 'created_at')
        read_only_fields = ('id', 'created_at')
