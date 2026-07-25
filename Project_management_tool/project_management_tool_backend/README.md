# Cadence Project Management Backend

## WebSockets Configuration

This project uses Django Channels and Redis for real-time WebSocket capabilities.

### 1. Prerequisites

You must run a local Redis server to handle the Channel Layer. The easiest way is via Docker:

```bash
docker run -p 6379:6379 -d redis:alpine
```

### 2. Running the Server

Since we are using Django Channels, the default WSGI server is superseded by the ASGI server (`daphne`).
You can still run the standard `runserver` command, which Daphne intercepts to provide ASGI capabilities:

```bash
python manage.py runserver
```

Or run Daphne directly:
```bash
daphne project_management_tool_backend.asgi:application
```

### 3. Connection Examples

The backend provides two primary WebSocket endpoints. Both require authentication via the JWT access token in the query string `?token=...`.

**Project WebSocket (Real-time board updates and Presence)**
```javascript
const ws = new WebSocket(`ws://127.0.0.1:8000/ws/project/${projectId}/?token=${accessToken}`);

ws.onmessage = (e) => {
    const message = JSON.parse(e.data);
    if (message.type === 'presence.joined') {
        console.log('User joined:', message.user);
    } else if (message.type === 'task.updated') {
        console.log('Task updated:', message.data);
    }
};
```

**Notifications WebSocket (Real-time notifications for the user)**
```javascript
const notifWs = new WebSocket(`ws://127.0.0.1:8000/ws/notifications/${userId}/?token=${accessToken}`);

notifWs.onmessage = (e) => {
    const message = JSON.parse(e.data);
    if (message.type === 'notification.new') {
        console.log('New Notification:', message.data);
    }
};
```
