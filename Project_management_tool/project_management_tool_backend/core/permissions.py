from rest_framework import permissions
from .models import Workspace, Project, Column, Task

class IsWorkspaceMember(permissions.BasePermission):
    """
    Custom permission to only allow members of a workspace to access its objects.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # We need to find the workspace for the given object
        workspace = None
        
        if isinstance(obj, Workspace):
            workspace = obj
        elif isinstance(obj, Project):
            workspace = obj.workspace
        elif isinstance(obj, Column):
            workspace = obj.project.workspace
        elif isinstance(obj, Task):
            workspace = obj.column.project.workspace
            
        if not workspace:
            return False
            
        # Check if the user is a member of this workspace
        return workspace.memberships.filter(user=request.user).exists()
