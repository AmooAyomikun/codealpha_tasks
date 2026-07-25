import json
from urllib.parse import parse_qs
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from core.models import WorkspaceMember, Project

User = get_user_model()

@database_sync_to_async
def get_user_from_token(token_string):
    try:
        UntypedToken(token_string)
        from rest_framework_simplejwt.authentication import JWTAuthentication
        auth = JWTAuthentication()
        validated_token = auth.get_validated_token(token_string)
        user = auth.get_user(validated_token)
        return user
    except (InvalidToken, TokenError, Exception):
        return AnonymousUser()

class JWTAuthMiddleware:
    """
    Custom middleware to authenticate users using JWT tokens via the query string.
    Example: ws://...?token=<jwt_token>
    """
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope.get('query_string', b'').decode()
        query_params = parse_qs(query_string)
        token = query_params.get('token', [None])[0]

        if token:
            scope['user'] = await get_user_from_token(token)
        else:
            scope['user'] = AnonymousUser()

        return await self.inner(scope, receive, send)

@database_sync_to_async
def is_member_of_project_workspace(user, project_id):
    if user.is_anonymous:
        return False
    try:
        project = Project.objects.get(id=project_id)
        return WorkspaceMember.objects.filter(workspace=project.workspace, user=user).exists()
    except Project.DoesNotExist:
        return False


class ProjectConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.project_id = self.scope['url_route']['kwargs']['project_id']
        self.room_group_name = f'project_{self.project_id}'
        self.user = self.scope.get('user', AnonymousUser())

        is_authorized = await is_member_of_project_workspace(self.user, self.project_id)

        if not is_authorized:
            await self.close(code=403)
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Broadcast presence
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'presence_message',
                'event': 'presence.joined',
                'user': {
                    'id': self.user.id,
                    'username': self.user.username,
                }
            }
        )

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name') and not self.user.is_anonymous:
            # Broadcast presence left
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'presence_message',
                    'event': 'presence.left',
                    'user': {
                        'id': self.user.id,
                        'username': self.user.username,
                    }
                }
            )
            # Leave room group
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def presence_message(self, event):
        await self.send(text_data=json.dumps({
            'type': event['event'],
            'user': event['user']
        }))

    async def board_message(self, event):
        await self.send(text_data=json.dumps({
            'type': event['event'],
            'data': event.get('data', {})
        }))


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.room_group_name = f'user_{self.user_id}'
        self.user = self.scope.get('user', AnonymousUser())

        if self.user.is_anonymous or str(self.user.id) != str(self.user_id):
            await self.close(code=403)
            return

        # Join user group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def notification_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'notification.new',
            'data': event.get('data', {})
        }))
