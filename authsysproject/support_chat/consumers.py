import pytz 
import json
import datetime
import asyncio
import functools
import re
from django.db.models import Q 
from concurrent.futures import ThreadPoolExecutor
from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User
from django.db.models import Q
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone 
from .models import ChatRoom, Message
from users.models.faq import FAQ

user_chat_state = {} 

email_executor = ThreadPoolExecutor(max_workers=5)

async def send_email_async(subject, message_body, recipient_list):
    """Sends an email in a separate thread to avoid blocking the event loop."""
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(
        email_executor,
        functools.partial(
            send_mail,
            subject,
            message_body,
            settings.EMAIL_HOST_USER,
            recipient_list,
            False
        )
    )

@sync_to_async
def get_user_role(user):
    """Determines the user's role based on their group membership."""
    if user.groups.filter(name="xraycoordinator").exists():
        return "xraycoordinator"
    elif user.groups.filter(name="radiologist").exists():
        return "radiologist"
    else:
        return "client"

@sync_to_async
def get_non_coordinator_room_users(room_id):
    """Finds all users in a given room who are not coordinators."""
    return list(User.objects.filter(
        Q(message__room_id=room_id) & ~Q(groups__name="xraycoordinator")
    ).distinct())


@sync_to_async
def search_faq(role, message):
    """Finds the most relevant FAQ by matching all FAQs and scoring them."""
    if role not in ["client", "radiologist"]:
        return None
    if not message:
        return None

    user_tokens = {t for t in re.split(r"\W+", message.lower()) if len(t) >= 3}
    if not user_tokens:
        return None

    faqs = FAQ.objects.filter(target_group=role)
    best_faq = None
    best_score = 0

    for faq in faqs:
        faq_text = f"{faq.question} {faq.answer}".lower()
        faq_tokens = {t for t in re.split(r"\W+", faq_text) if len(t) >= 3}

        overlap = user_tokens & faq_tokens
        score = len(overlap)

        if score > best_score:
            best_score = score
            best_faq = faq

    if best_score > 0:
        return best_faq
    else:
        return None

@sync_to_async
def fetch_faq_list(role):
    """Fetches a list of all FAQs for a specific role."""
    if role not in ["client", "radiologist"]:
        return []

    faqs = FAQ.objects.filter(target_group=role).values("question", "answer")
    return list(faqs)

@sync_to_async 
def has_any_messages(room_id):
    """Checks if a chat room has any messages."""
    return Message.objects.filter(room_id=room_id).exists()

@sync_to_async
def fetch_recent_messages(room_id, limit=50, hide_bot=False):
    """Fetches recent messages and correctly converts their UTC timestamps to IST."""
    qs = Message.objects.filter(room_id=room_id)
    if hide_bot:
        qs = qs.exclude(sender__username="SystemBot")
    
    qs = qs.select_related("sender", "tagged_user").order_by("id")[:limit]

    ist_timezone = pytz.timezone('Asia/Kolkata')
    
    return [
        {
            "id": m.id,
            "message": m.content,
            "sender": m.sender.username if m.sender else "",
            "timestamp": m.created_at.astimezone(ist_timezone).isoformat() if getattr(m, 'created_at', None) else "",
            "tagged_username": m.tagged_user.username if m.tagged_user else None
        }
        for m in qs
    ]

@sync_to_async
def save_bot_message(room_id, content):
    """Saves a message from the SystemBot to the database."""
    try:
        room = ChatRoom.objects.get(id=room_id)
        bot_user, _ = User.objects.get_or_create(username="SystemBot", defaults={"email": "bot@example.com"})
        Message.objects.create(room=room, sender=bot_user, content=content)
        print("🤖 Bot message saved.")
    except Exception as e:
        print(f"❌ Failed to save bot message: {e}")


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f"chat_{self.room_id}"
        user = self.scope.get("user")

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        if user and user.is_authenticated:
            await self.channel_layer.group_add(f"user_{user.id}", self.channel_name)

        await self.accept()
        print(f"🟢 WebSocket connected to room: {self.room_id}")

        if self.room_id not in user_chat_state:
            user_chat_state[self.room_id] = {
                "awaiting_confirmation": False,
                "greeted": False
            }

        has_any_messages_in_room = await has_any_messages(self.room_id)
        if not has_any_messages_in_room:
            role = await get_user_role(user)
            greet_msg = "Hi! I'm Echo. How can I help you today?"
            await self.send_bot_message_and_save(greet_msg)

            faqs = await fetch_faq_list(role)
            print(">>> Sending FAQs:", faqs) 

            if faqs:
                await self.send(text_data=json.dumps({
                    "type": "faq_list",
                    "faqs": faqs
                }))

        role = await get_user_role(user)
        hide_bot = (role == "xraycoordinator")
        recent_to_display = await fetch_recent_messages(self.room_id, limit=50, hide_bot=hide_bot)
        await self.send(text_data=json.dumps({"type": "history", "messages": recent_to_display}))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        user = self.scope.get("user")
        if user and user.is_authenticated:
            await self.channel_layer.group_discard(f"user_{user.id}", self.channel_name)
        print(f"🔴 WebSocket disconnected from room: {self.room_id}")

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get("type", "message")

        if message_type == "message":
            message = data['message']
            user = self.scope["user"]
            username = user.username
            tagged_username = data.get('tagged_username')

            if await self.is_room_closed():
                print("⚠️ Attempt to send message in closed room.")
                return

            role = await get_user_role(user)
            
            match = re.search(r"@([\w.@+-]+)", message)
            if match:
                tagged_username = match.group(1).strip() 
                print(f"User {username} tagged {tagged_username}")
            
            is_coordinator_in_chat = await self.has_coordinator_messages()
            is_tagged = bool(tagged_username)

            if is_coordinator_in_chat or is_tagged or role in ["xraycoordinator"]:
                await self.save_and_broadcast_message(username, message, tagged_username)
                
                if is_tagged:
                    asyncio.create_task(self.send_tagged_coordinator_email(username, message, tagged_username))
                elif role in ["client", "radiologist"]:
                    asyncio.create_task(self.send_all_coordinator_email(username, message))
                
                return

            if user_chat_state.get(self.room_id, {}).get("awaiting_confirmation"):
                await self.save_and_broadcast_message(username, message, tagged_username)
                
                if message.lower() in ["yes", "y"]:
                    thank_msg = "Glad I could help! Closing the chat now."
                    await self.send_bot_message_and_save(thank_msg)
                    user_chat_state[self.room_id]["awaiting_confirmation"] = False
                    await self.mark_room_closed()
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {'type': 'chat_closed', 'sender': self.scope["user"].username}
                    )
                elif message.lower() in ["no", "n"]:
                    connect_msg = "Okay, connecting you to a coordinator..."
                    await self.send_bot_message_and_save(connect_msg)
                    user_chat_state[self.room_id]["awaiting_confirmation"] = False
                    asyncio.create_task(self.send_all_coordinator_email(username, message))
                else:
                    retry_msg = "Please reply with yes (close) or no (connect)."
                    await self.send_bot_message_and_save(retry_msg)
                return 
            
            faq = await search_faq(role, message)
            if faq:
                await self.save_and_broadcast_message(username, message, tagged_username)
                await self.send_bot_message_and_save(faq.answer)
                follow_msg = "Was this helpful? (yes = close / no = connect to coordinator)"
                await self.send_bot_message_and_save(follow_msg)
                user_chat_state[self.room_id]["awaiting_confirmation"] = True
            else:
                await self.save_and_broadcast_message(username, message, tagged_username)
                unsure_msg = "I’m not sure about that. Connecting you to a coordinator..."
                await self.send_bot_message_and_save(unsure_msg)
                asyncio.create_task(self.send_all_coordinator_email(username, message))
            
        elif message_type == "close_chat":
            await self.mark_room_closed()
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_closed',
                    'sender': self.scope["user"].username
                }
            )

        elif message_type == "file":
            file_urls = data.get("file_urls", [])
            username = self.scope["user"].username
            if await self.is_room_closed():
                print("⚠️ Attempt to send files in closed room.")
                return
            
            now_utc = timezone.now()
            now_ist = now_utc.astimezone(pytz.timezone('Asia/Kolkata'))

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_file',
                    'sender': username,
                    'timestamp': now_ist.isoformat(),
                    'file_urls': file_urls
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message'],
            'sender': event['sender'],
            'timestamp': event['timestamp'],
            'file_urls': event.get('file_urls', []),
            'tagged_username': event.get('tagged_username')
        }))

    async def chat_closed(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_closed',
            'sender': event['sender'],
            'message': 'Chat has been closed by coordinator.'
        }))

    async def chat_file(self, event):
        await self.send(text_data=json.dumps({
            "type": "file",
            "file_urls": event["file_urls"],
            "sender": event["sender"],
            "timestamp": event["timestamp"],
        }))

    async def coordinator_message_alert(self, event):
        """Handler for alerts sent from coordinators to clients/radiologists."""
        await self.send(text_data=json.dumps({
            "type": "alert",
            "room_id": event["room_id"],
            "sender": event["sender"],
            "message": event["message"],
        }))


    async def send_bot_message_and_save(self, message):
        """Helper to consistently send a bot message and save it to all users with an IST timestamp."""
        await save_bot_message(self.room_id, message)
        
        now_utc = timezone.now()
        now_ist = now_utc.astimezone(pytz.timezone('Asia/Kolkata'))

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': 'SystemBot',
                'timestamp': now_ist.isoformat(),
                'tagged_username': None
            }
        )

    async def save_and_broadcast_message(self, username, message, tagged_username):
        """Saves a user message and broadcasts it to the group, including new alert logic."""
        await self.save_message(username, self.room_id, message, tagged_username)
        
        now_utc = timezone.now()
        now_ist = now_utc.astimezone(pytz.timezone('Asia/Kolkata'))

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': username,
                'timestamp': now_ist.isoformat(),
                'tagged_username': tagged_username
            }
        )

        user = self.scope["user"]
        role = await get_user_role(user)

        if role in ["client", "radiologist"]:
            print(f"Sending alert to coordinators for room {self.room_id} by {username}")
            await self.channel_layer.group_send(
                "alerts",
                {
                    "type": "new_message_alert",
                    "room_id": self.room_id,
                    "sender": username,
                    "message": message,
                }
            )

        elif role == "xraycoordinator":
            participant_users = await get_non_coordinator_room_users(self.room_id)
            for p_user in participant_users:
                print(f"Sending alert to {p_user.username} (client/radiologist)")
                await self.channel_layer.group_send(
                    f"user_{p_user.id}",
                    {
                        "type": "coordinator_message_alert",
                        "room_id": self.room_id,
                        "sender": username,
                        "message": message,
                    }
                )

    async def send_tagged_coordinator_email(self, sender_username, message, tagged_username):
        """Sends an email notification to a specific tagged coordinator, only once per room."""
        try:
            room = await self.get_room()
            if room.email_sent:
                return

            tagged_user = await self.get_user_by_username(tagged_username)
            if tagged_user and tagged_user.email:
                subject = f"You were tagged in a chat by {sender_username}"
                message_body = f"You have been tagged in a new chat message by {sender_username}.\n\nMessage:\n{message}"
                await send_email_async(subject, message_body, [tagged_user.email])
                
                room.email_sent = True
                await self.save_room(room)
            else:
                print(f"❌ Tagged user {tagged_username} not found or has no email.")
                await self.send_all_coordinator_email(sender_username, message)
        except Exception as e:
            print(f"❌ Failed to send tagged email: {e}")

    async def send_all_coordinator_email(self, username, message):
        """Sends an email notification to all coordinators, only once per room."""
        try:
            room = await self.get_room()
            if room.email_sent: 
                return

            coordinator_emails = await self.get_all_coordinator_emails()
            if coordinator_emails:
                subject = "New Chat Message Requiring Assistance"

                message_body = (
                    f"Hi Coordinators,\n\n"
                    f"A new message from {username} has been received and requires coordinator assistance.\n\n"
                    f"Message:\n{message}\n\n"
                    f"Thank You,\n"
                    f"Sent by Echo\n"
                    f"(created by Gautam)"
                )

                await send_email_async(subject, message_body, coordinator_emails)
                
                print("Email sent")

                room.email_sent = True
                await self.save_room(room)
        except Exception as e:
            print(f"❌ Failed to send group email: {e}")

    @sync_to_async
    def get_room(self):
        return ChatRoom.objects.select_related('participant2').get(id=self.room_id)

    @sync_to_async
    def save_room(self, room):
        room.save()

    @sync_to_async
    def get_user_by_username(self, username):
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist:
            return None

    @sync_to_async
    def has_coordinator_messages(self):
        """Check if any message has been sent by a coordinator in this room."""
        return Message.objects.filter(
            Q(room_id=self.room_id) & Q(sender__groups__name="xraycoordinator")
        ).exists()

    @sync_to_async
    def save_message(self, username, room_id, message, tagged_username=None):
        try:
            user = User.objects.get(username=username)
            room = ChatRoom.objects.get(id=room_id)
            tagged_user = None
            if tagged_username:
                try:
                    tagged_user = User.objects.get( Q(username__iexact=tagged_username) | Q(email__iexact=tagged_username))
                    print(f"✅ Successfully found tagged user: {tagged_user.username}")

                except User.DoesNotExist:
                    pass
            Message.objects.create(
                room=room,
                sender=user,
                content=message,
                tagged_user=tagged_user
            )
            print("✅ Message saved to database.")
        except Exception as e:
            print(f"❌ Failed to save message: {e}")

    @sync_to_async
    def mark_room_closed(self):
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            room.is_closed = True
            room.save()
        except ChatRoom.DoesNotExist:
            print("❌ Room not found when trying to close.")

    @sync_to_async
    def is_room_closed(self):
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            return room.is_closed
        except ChatRoom.DoesNotExist:
            return True

    @sync_to_async
    def get_all_coordinator_emails(self):
        return list(User.objects.filter(groups__name="xraycoordinator").values_list("email", flat=True))

    @sync_to_async
    def get_participant2_and_email(self, room):
        if room.participant2 and room.participant2.email:
            return room.participant2.email
        return None

class AlertConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        if not user.is_authenticated:
            await self.close()
            return
        
        self.is_coordinator = await get_user_role(user) == "xraycoordinator"
        if self.is_coordinator:
            await self.channel_layer.group_add("alerts", self.channel_name)
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        if self.is_coordinator:
            await self.channel_layer.group_discard("alerts", self.channel_name)

    async def new_message_alert(self, event):
        if self.is_coordinator:
            await self.send(text_data=json.dumps({
                "type": "alert",
                "room_id": event["room_id"],
                "sender": event["sender"],
                "message": event["message"],
            }))