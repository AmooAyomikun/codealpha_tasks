from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from .models import Workspace, WorkspaceMember, Project, Column, Task

User = get_user_model()

class CadenceAPITests(APITestCase):

    def setUp(self):
        # Create users
        self.user1 = User.objects.create_user(username='user1', email='user1@test.com', password='password123')
        self.user2 = User.objects.create_user(username='user2', email='user2@test.com', password='password123')
        self.non_member = User.objects.create_user(username='non_member', email='non_member@test.com', password='password123')

        # Create workspace and add members
        self.workspace = Workspace.objects.create(name='Test Workspace', owner=self.user1)
        WorkspaceMember.objects.create(workspace=self.workspace, user=self.user1, role='owner')
        WorkspaceMember.objects.create(workspace=self.workspace, user=self.user2, role='member')
        
        # Create a second workspace where non_member is a member, just to test isolation
        self.workspace2 = Workspace.objects.create(name='Other Workspace', owner=self.non_member)
        WorkspaceMember.objects.create(workspace=self.workspace2, user=self.non_member, role='owner')

        # Create projects and columns
        self.project1 = Project.objects.create(workspace=self.workspace, name='Project 1')
        self.project2 = Project.objects.create(workspace=self.workspace2, name='Project 2')
        
        self.col1 = Column.objects.create(project=self.project1, name='To Do', order=0)
        self.col2 = Column.objects.create(project=self.project1, name='In Progress', order=1)
        
        self.task1 = Task.objects.create(column=self.col1, title='Task 1', order=0)
        self.task2 = Task.objects.create(column=self.col1, title='Task 2', order=1)
        self.task3 = Task.objects.create(column=self.col1, title='Task 3', order=2)

    def authenticate_as(self, user):
        response = self.client.post(reverse('auth_login'), {
            'username': user.username,
            'password': 'password123'
        }, format='json')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + response.data['access'])

    def test_create_project(self):
        self.authenticate_as(self.user1)
        url = reverse('project-list')
        data = {
            'workspace': self.workspace.id,
            'name': 'New Project',
            'description': 'Description'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Project.objects.count(), 3)
        self.assertEqual(Project.objects.get(id=response.data['id']).name, 'New Project')

    def test_create_task(self):
        self.authenticate_as(self.user1)
        url = reverse('task-list')
        data = {
            'column': self.col1.id,
            'title': 'New Task',
            'description': 'Test description',
            'order': 3
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.count(), 4)

    def test_create_task_with_non_member_assignee(self):
        self.authenticate_as(self.user1)
        url = reverse('task-list')
        data = {
            'column': self.col1.id,
            'title': 'New Task',
            'assignees': [self.non_member.id]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('assignees', response.data)

    def test_move_task_within_same_column(self):
        self.authenticate_as(self.user1)
        # Move task3 (order 2) to order 0
        url = reverse('task-detail', args=[self.task3.id])
        response = self.client.patch(url, {'order': 0}, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.task1.refresh_from_db()
        self.task2.refresh_from_db()
        self.task3.refresh_from_db()
        
        self.assertEqual(self.task3.order, 0)
        self.assertEqual(self.task1.order, 1) # Shifted down
        self.assertEqual(self.task2.order, 2) # Shifted down

    def test_move_task_to_different_column(self):
        self.authenticate_as(self.user1)
        # Move task1 (order 0) to col2 at order 0
        url = reverse('task-detail', args=[self.task1.id])
        response = self.client.patch(url, {'column': self.col2.id, 'order': 0}, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.task1.refresh_from_db()
        self.task2.refresh_from_db()
        self.task3.refresh_from_db()
        
        self.assertEqual(self.task1.column, self.col2)
        self.assertEqual(self.task1.order, 0)
        self.assertEqual(self.task2.order, 0) # Shifted up in col1
        self.assertEqual(self.task3.order, 1) # Shifted up in col1

    def test_access_project_non_member(self):
        # Authenticate as a user who is NOT in the workspace of project1
        self.authenticate_as(self.non_member)
        url = reverse('project-detail', args=[self.project1.id])
        response = self.client.get(url)
        
        # Because we filter the queryset to only workspaces the user is part of, 
        # this will return 404 instead of 403 (which is standard DRF behavior for ModelViewSets).
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # Trying to update should also be 404
        response = self.client.patch(url, {'name': 'Hacked Project'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_access_task_non_member(self):
        self.authenticate_as(self.non_member)
        url = reverse('task-detail', args=[self.task1.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
