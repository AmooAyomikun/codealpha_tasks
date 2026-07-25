from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer, RegisterSerializer

User = get_user_model()

class LoginThrottle(AnonRateThrottle):
    rate = '10/minute'

class RegisterThrottle(AnonRateThrottle):
    rate = '5/minute'

class ThrottledLoginView(TokenObtainPairView):
    throttle_classes = [LoginThrottle]

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer
    throttle_classes = [RegisterThrottle]

class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter
from django.db import transaction
from django.db.models import F, Count
from django.shortcuts import get_object_or_404

import re
from .models import Workspace, WorkspaceMember, Project, Column, Task, ActivityLogEntry, Subtask, TaskLabel, TaskDependency, Comment, Notification
from .serializers import (
    WorkspaceSerializer, ProjectSerializer, ColumnSerializer, 
    TaskSerializer, ActivityLogEntrySerializer, SubtaskSerializer,
    TaskLabelSerializer, TaskDependencySerializer, CommentSerializer,
    NotificationSerializer
)
from .permissions import IsWorkspaceMember
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def notify_project(project_id, event, data):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'project_{project_id}',
        {
            'type': 'board_message',
            'event': event,
            'data': data
        }
    )

def notify_user(user_id, data):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'user_{user_id}',
        {
            'type': 'notification_message',
            'data': data
        }
    )

class WorkspaceViewSet(viewsets.ModelViewSet):
    serializer_class = WorkspaceSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get_queryset(self):
        return Workspace.objects.filter(memberships__user=self.request.user).distinct()

    def perform_create(self, serializer):
        workspace = serializer.save(owner=self.request.user)
        WorkspaceMember.objects.create(workspace=workspace, user=self.request.user, role='owner')

    @action(detail=True, methods=['post'])
    def invite(self, request, pk=None):
        workspace = self.get_object()
        user_id = request.data.get('user_id')
        role = request.data.get('role', 'member')
        
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        user = get_object_or_404(User, id=user_id)
        
        if WorkspaceMember.objects.filter(workspace=workspace, user=user).exists():
            return Response({'error': 'User is already a member'}, status=status.HTTP_400_BAD_REQUEST)
            
        WorkspaceMember.objects.create(workspace=workspace, user=user, role=role)
        return Response({'status': 'User invited successfully'}, status=status.HTTP_200_OK)


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get_queryset(self):
        queryset = Project.objects.filter(workspace__memberships__user=self.request.user).distinct()
        workspace_id = self.request.query_params.get('workspace')
        if workspace_id:
            queryset = queryset.filter(workspace_id=workspace_id)
        return queryset
        
    def perform_create(self, serializer):
        project = serializer.save()
        ActivityLogEntry.objects.create(
            project=project,
            user=self.request.user,
            action_type="Project Created",
            description=f"Project '{project.name}' was created."
        )

    def perform_update(self, serializer):
        project = serializer.save()
        ActivityLogEntry.objects.create(
            project=project,
            user=self.request.user,
            action_type="Project Updated",
            description=f"Project '{project.name}' was updated."
        )

    @action(detail=True, methods=['get'])
    def workload(self, request, pk=None):
        project = self.get_object()
        workload_data = User.objects.filter(
            assigned_tasks__column__project=project
        ).annotate(
            task_count=Count('assigned_tasks')
        ).values('id', 'username', 'task_count')
        return Response(workload_data)


class ColumnViewSet(viewsets.ModelViewSet):
    serializer_class = ColumnSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get_queryset(self):
        queryset = Column.objects.filter(project__workspace__memberships__user=self.request.user).distinct()
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    def perform_create(self, serializer):
        col = serializer.save()
        ActivityLogEntry.objects.create(
            project=col.project,
            user=self.request.user,
            action_type="Column Created",
            description=f"Column '{col.name}' was created."
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        old_order = instance.order
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        new_order = serializer.validated_data.get('order', old_order)

        if 'order' in request.data and old_order != new_order:
            with transaction.atomic():
                if new_order > old_order:
                    Column.objects.filter(
                        project=instance.project, 
                        order__gt=old_order, 
                        order__lte=new_order
                    ).update(order=F('order') - 1)
                else:
                    Column.objects.filter(
                        project=instance.project, 
                        order__gte=new_order, 
                        order__lt=old_order
                    ).update(order=F('order') + 1)
                self.perform_update(serializer)
        else:
            self.perform_update(serializer)

        return Response(serializer.data)

    def perform_update(self, serializer):
        col = serializer.save()
        ActivityLogEntry.objects.create(
            project=col.project,
            user=self.request.user,
            action_type="Column Updated",
            description=f"Column '{col.name}' was updated."
        )

    def perform_destroy(self, instance):
        project = instance.project
        name = instance.name
        with transaction.atomic():
            Column.objects.filter(
                project=instance.project,
                order__gt=instance.order
            ).update(order=F('order') - 1)
            instance.delete()
            ActivityLogEntry.objects.create(
                project=project,
                user=self.request.user,
                action_type="Column Deleted",
                description=f"Column '{name}' was deleted."
            )


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]
    filter_backends = [OrderingFilter]
    ordering_fields = ['due_date', 'order', 'priority', 'created_at']

    def get_queryset(self):
        queryset = Task.objects.filter(column__project__workspace__memberships__user=self.request.user).distinct()
        
        column_id = self.request.query_params.get('column')
        if column_id:
            queryset = queryset.filter(column_id=column_id)

        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(column__project_id=project_id)

        assignee = self.request.query_params.get('assignee')
        if assignee:
            queryset = queryset.filter(assignees__id=assignee)
            
        label = self.request.query_params.get('label')
        if label:
            queryset = queryset.filter(labels__id=label)
            
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
            
        return queryset

    def perform_create(self, serializer):
        with transaction.atomic():
            task = serializer.save(created_by=self.request.user)
            ActivityLogEntry.objects.create(
                task=task,
                project=task.column.project,
                user=self.request.user,
                action_type="Task Created",
                description=f"Task '{task.title}' was created."
            )
            notify_project(task.column.project_id, 'task.created', serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        old_column = instance.column
        old_order = instance.order
        old_assignees = set(instance.assignees.values_list('id', flat=True))
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        new_column = serializer.validated_data.get('column', old_column)
        new_order = serializer.validated_data.get('order', old_order)

        if 'column' in request.data or 'order' in request.data:
            with transaction.atomic():
                if old_column == new_column and old_order != new_order:
                    if new_order > old_order:
                        Task.objects.filter(
                            column=old_column, 
                            order__gt=old_order, 
                            order__lte=new_order
                        ).update(order=F('order') - 1)
                    else:
                        Task.objects.filter(
                            column=old_column, 
                            order__gte=new_order, 
                            order__lt=old_order
                        ).update(order=F('order') + 1)
                elif old_column != new_column:
                    Task.objects.filter(
                        column=old_column,
                        order__gt=old_order
                    ).update(order=F('order') - 1)
                    Task.objects.filter(
                        column=new_column,
                        order__gte=new_order
                    ).update(order=F('order') + 1)

                self.perform_update(serializer)
        else:
            self.perform_update(serializer)

        if 'assignees' in request.data:
            new_assignees = set(serializer.instance.assignees.values_list('id', flat=True))
            added_assignees = new_assignees - old_assignees
            for user_id in added_assignees:
                if user_id != request.user.id:
                    notif = Notification.objects.create(
                        user_id=user_id,
                        type='assignment',
                        body=f"You were assigned to task '{serializer.instance.title}' by {request.user.username}.",
                        related_task_id=serializer.instance.id
                    )
                    notify_user(user_id, NotificationSerializer(notif).data)

        notify_project(serializer.instance.column.project_id, 'task.updated', serializer.data)
        return Response(serializer.data)
        
    def perform_update(self, serializer):
        task = serializer.save()
        ActivityLogEntry.objects.create(
            task=task,
            project=task.column.project,
            user=self.request.user,
            action_type="Task Updated",
            description=f"Task '{task.title}' was updated."
        )

    def perform_destroy(self, instance):
        project = instance.column.project
        title = instance.title
        with transaction.atomic():
            Task.objects.filter(
                column=instance.column,
                order__gt=instance.order
            ).update(order=F('order') - 1)
            instance.delete()
            ActivityLogEntry.objects.create(
                project=project,
                user=self.request.user,
                action_type="Task Deleted",
                description=f"Task '{title}' was deleted."
            )
            notify_project(project.id, 'task.deleted', {'id': instance.id})

class SubtaskViewSet(viewsets.ModelViewSet):
    serializer_class = SubtaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get_queryset(self):
        queryset = Subtask.objects.filter(task__column__project__workspace__memberships__user=self.request.user).distinct()
        task_id = self.request.query_params.get('task')
        if task_id:
            queryset = queryset.filter(task_id=task_id)
        return queryset

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        old_order = instance.order
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        new_order = serializer.validated_data.get('order', old_order)

        if 'order' in request.data and old_order != new_order:
            with transaction.atomic():
                if new_order > old_order:
                    Subtask.objects.filter(
                        task=instance.task, 
                        order__gt=old_order, 
                        order__lte=new_order
                    ).update(order=F('order') - 1)
                else:
                    Subtask.objects.filter(
                        task=instance.task, 
                        order__gte=new_order, 
                        order__lt=old_order
                    ).update(order=F('order') + 1)
                self.perform_update(serializer)
        else:
            self.perform_update(serializer)

        return Response(serializer.data)

    def perform_destroy(self, instance):
        with transaction.atomic():
            Subtask.objects.filter(
                task=instance.task,
                order__gt=instance.order
            ).update(order=F('order') - 1)
            instance.delete()


class TaskLabelViewSet(viewsets.ModelViewSet):
    serializer_class = TaskLabelSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get_queryset(self):
        queryset = TaskLabel.objects.filter(project__workspace__memberships__user=self.request.user).distinct()
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset


class TaskDependencyViewSet(viewsets.ModelViewSet):
    serializer_class = TaskDependencySerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get_queryset(self):
        queryset = TaskDependency.objects.filter(task__column__project__workspace__memberships__user=self.request.user).distinct()
        task_id = self.request.query_params.get('task')
        if task_id:
            queryset = queryset.filter(task_id=task_id)
        return queryset


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get_queryset(self):
        queryset = Comment.objects.filter(task__column__project__workspace__memberships__user=self.request.user).distinct()
        task_id = self.request.query_params.get('task')
        if task_id:
            queryset = queryset.filter(task_id=task_id)
        return queryset

    def perform_create(self, serializer):
        with transaction.atomic():
            comment = serializer.save(user=self.request.user)
            
            import re
            body = comment.body
            usernames = set(re.findall(r'@(\w+)', body))
            mentioned_users = set()
            
            if usernames:
                workspace = comment.task.column.project.workspace
                valid_users = User.objects.filter(
                    username__in=usernames,
                    workspace_memberships__workspace=workspace
                ).distinct()
                
                comment.mentions.set(valid_users)
                
                for u in valid_users:
                    mentioned_users.add(u.id)
                    if u.id != self.request.user.id:
                        notif = Notification.objects.create(
                            user=u,
                            type='mention',
                            body=f"{self.request.user.username} mentioned you in a comment on '{comment.task.title}'.",
                            related_task_id=comment.task.id
                        )
                        notify_user(u.id, NotificationSerializer(notif).data)

            assignees = comment.task.assignees.all()
            for assignee in assignees:
                if assignee.id != self.request.user.id and assignee.id not in mentioned_users:
                    notif = Notification.objects.create(
                        user=assignee,
                        type='comment',
                        body=f"{self.request.user.username} commented on '{comment.task.title}'.",
                        related_task_id=comment.task.id
                    )
                    notify_user(assignee.id, NotificationSerializer(notif).data)

            from .serializers import CommentSerializer
            notify_project(comment.task.column.project_id, 'comment.created', CommentSerializer(comment).data)


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.read = True
        notification.save()
        return Response({'status': 'marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().update(read=True)
        return Response({'status': 'all marked as read'})
