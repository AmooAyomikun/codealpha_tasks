from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer, RegisterSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

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

from .models import Workspace, WorkspaceMember, Project, Column, Task, ActivityLogEntry
from .serializers import (
    WorkspaceSerializer, ProjectSerializer, ColumnSerializer, 
    TaskSerializer, ActivityLogEntrySerializer
)
from .permissions import IsWorkspaceMember

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

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        old_column = instance.column
        old_order = instance.order
        
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
