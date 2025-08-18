from django.contrib import admin

# Register your models here.


from django.contrib import admin
from .models import ChatRoom, Message

@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ('participant1', 'participant2', 'created_at', 'is_closed', 'email_sent')
    search_fields = ('participant1__username', 'participant2__username')
    list_filter = ('is_closed', 'created_at')

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('room', 'sender', 'timestamp', 'tagged_user')
    search_fields = ('sender__username', 'content')
    list_filter = ('timestamp',)
