import os
import random
from datetime import timedelta
from django.utils import timezone
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import Workspace, WorkspaceMember, Project, Column, Task, Subtask, TaskLabel, Comment

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with realistic demo data'

    def handle(self, *args, **kwargs):
        self.stdout.write("Clearing existing demo data...")
        # Clear data but preserve superusers
        User.objects.filter(is_superuser=False).delete()
        Workspace.objects.all().delete()
        
        # Create users
        users = []
        user_data = [
            ('alice', 'alice@example.com', 'Alice', 'Smith'),
            ('bob', 'bob@example.com', 'Bob', 'Jones'),
            ('charlie', 'charlie@example.com', 'Charlie', 'Brown'),
            ('diana', 'diana@example.com', 'Diana', 'Prince'),
            ('eve', 'eve@example.com', 'Eve', 'Adams'),
            ('frank', 'frank@example.com', 'Frank', 'Castle'),
            ('grace', 'grace@example.com', 'Grace', 'Hopper'),
            ('hank', 'hank@example.com', 'Hank', 'Pym'),
        ]
        for username, email, first_name, last_name in user_data:
            user = User.objects.create_user(
                username=username,
                email=email,
                password='password123',
                first_name=first_name,
                last_name=last_name
            )
            users.append(user)
        self.stdout.write("Users created.")

        # Create Workspaces
        ws1 = Workspace.objects.create(name="Acme Engineering", owner=users[0])
        ws2 = Workspace.objects.create(name="Acme Marketing", owner=users[3])
        
        # Add members
        for u in users:
            WorkspaceMember.objects.get_or_create(workspace=ws1, user=u, defaults={'role': 'member'})
        for u in users[3:6]:
            WorkspaceMember.objects.get_or_create(workspace=ws2, user=u, defaults={'role': 'member'})
            
        self.stdout.write("Workspaces created.")

        # Create Projects
        p1 = Project.objects.create(workspace=ws1, name="Frontend Rewrite", description="Migrate to React 18")
        p2 = Project.objects.create(workspace=ws1, name="Backend API v2", description="Django REST Framework updates")
        p3 = Project.objects.create(workspace=ws2, name="Q3 Marketing Campaign", description="Ad creatives and copy")
        p4 = Project.objects.create(workspace=ws2, name="Social Media Strategy", description="Twitter & LinkedIn growth")
        
        projects = [p1, p2, p3, p4]
        
        # Generate data for each project
        now = timezone.now()
        for p in projects:
            # Labels
            l1 = TaskLabel.objects.create(project=p, name="Bug", color="#ef4444")
            l2 = TaskLabel.objects.create(project=p, name="Feature", color="#3b82f6")
            l3 = TaskLabel.objects.create(project=p, name="Urgent", color="#f59e0b")
            labels = [l1, l2, l3]
            
            # Columns
            c1 = Column.objects.create(project=p, name="To Do", order=1)
            c2 = Column.objects.create(project=p, name="In Progress", order=2)
            c3 = Column.objects.create(project=p, name="Review", order=3)
            c4 = Column.objects.create(project=p, name="Done", order=4)
            columns = [c1, c2, c3, c4]
            
            # Tasks
            project_members = list(User.objects.filter(workspace_memberships__workspace=p.workspace))
            
            for i in range(1, random.randint(15, 25)):
                col = random.choice(columns)
                due_date = now + timedelta(days=random.randint(-10, 30))
                priority = random.choice(['low', 'medium', 'high'])
                creator = random.choice(project_members)
                
                task = Task.objects.create(
                    column=col,
                    title=f"{p.name} Task {i}",
                    description=f"Detailed description for {p.name} task {i}. This needs to be completed thoroughly.",
                    due_date=due_date,
                    priority=priority,
                    created_by=creator,
                    order=i
                )
                
                # Assignees
                assignees = random.sample(project_members, k=random.randint(0, 3))
                task.assignees.set(assignees)
                
                # Labels
                task_labels = random.sample(labels, k=random.randint(0, 2))
                task.labels.set(task_labels)
                
                # Subtasks
                for j in range(random.randint(0, 4)):
                    Subtask.objects.create(
                        task=task,
                        title=f"Subtask {j+1}",
                        is_complete=random.choice([True, False]),
                        order=j+1
                    )
                    
                # Comments
                for j in range(random.randint(0, 3)):
                    commenter = random.choice(project_members)
                    Comment.objects.create(
                        task=task,
                        user=commenter,
                        body=f"This is a sample comment on {task.title} by {commenter.username}."
                    )
                    
        self.stdout.write(self.style.SUCCESS('Successfully seeded the database!'))
