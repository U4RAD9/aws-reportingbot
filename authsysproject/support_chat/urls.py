from django.conf.urls.static import static
from django.conf import settings
from django.urls import path
from .views import coordinator_dashboard  # ✅ FIXED
from . import consumers

from support_chat import views


urlpatterns = [
    path("coordinator-dashboard/", coordinator_dashboard, name="coordinator_dashboard"),

    path("ws/chat/<str:room_name>/", consumers.ChatConsumer.as_asgi()),
    path('chat/<int:room_id>/', views.chat_room, name='chat_room'),

    path('client/<int:room_id>/', views.room_view, name='client-room'),

    path('chat/<int:room_id>/messages/', views.recent_messages, name='get_messages'),


    path('api/chat/<int:room_id>/messages/', views.get_chat_messages, name='get_chat_messages'),

    path('chats/recent/', views.recent_chats, name='recent_chats'),
    path('chats/new/', views.start_new_chat_api, name='start_new_chat'),


    path("api/coordinators/", views.get_coordinators, name="get_coordinators"),
    path('api/user/open-room/', views.get_user_open_room, name='get_user_open_room'),

    path('api/recent-chats/', views.recent_chats_api, name='recent_chats_api'),

    path("api/chat/<int:room_id>/send-files/", views.send_files),

    path("serve-file/<path:key>/", views.serve_chat_file, name="serve_chat_file"),
    path('api/chat/<int:room_id>/close/', views.close_chat_room, name='close_chat_room'),










]
