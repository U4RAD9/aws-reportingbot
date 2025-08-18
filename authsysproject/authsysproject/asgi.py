import os
import django

# Set default settings module BEFORE anything Django-related
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'authsysproject.settings')

# Setup Django FIRST
django.setup()

# Now safely import Django and channels stuff
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import support_chat.routing

# Define application
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            support_chat.routing.websocket_urlpatterns
        )
    ),
})
