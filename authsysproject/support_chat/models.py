from django.db import models
from django.contrib.auth.models import User

class ChatRoom(models.Model):
    participant1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chatroom_client')
    participant2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chatroom_coordinator', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_closed = models.BooleanField(default=False)  
    email_sent = models.BooleanField(default=False)

    def __str__(self):
        participant2_name = self.participant2.username if self.participant2 else "Not Assigned"
        return f"Room: {self.participant1.username} ↔ {participant2_name}"


class Message(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    tagged_user = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='tagged_messages'
    )

    file = models.CharField(max_length=500, null=True, blank=True)


    def __str__(self):
        return f"[{self.timestamp}] {self.sender.username}: {self.content}"
