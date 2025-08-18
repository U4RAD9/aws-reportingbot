from collections import defaultdict
from django.shortcuts import render
from django.contrib.auth.decorators import user_passes_test
from django.shortcuts import render
from .models import ChatRoom, Message

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required

from django.contrib.auth.models import Group

from django.http import JsonResponse

from django.contrib.auth.decorators import login_required
from django.db.models import Q

from django.shortcuts import get_object_or_404
from django.http import JsonResponse
import re

from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from collections import defaultdict
from django.db.models import Q, Max, F, Case, When, BooleanField, Count

from django.contrib.auth.models import User

from django.views.decorators.csrf import csrf_exempt

from django.http import JsonResponse


from django.utils.timezone import localtime


from django.conf import settings

import os

from django.http import Http404, HttpResponse
import boto3
from botocore.exceptions import ClientError


from urllib.parse import unquote
from django.http import Http404, HttpResponseRedirect


from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from django.contrib.auth.models import User
from django.http import JsonResponse, HttpResponseBadRequest

from django.contrib.auth.models import User

from django.conf import settings
import boto3

from botocore.exceptions import ClientError


from urllib.parse import unquote
from django.http import Http404, HttpResponseRedirect

def is_coordinator(user):
    return user.groups.filter(name="xraycoordinator").exists()


@login_required
def create_chat_room(request, other_user_id):
    other_user = get_object_or_404(User, id=other_user_id)
    room = ChatRoom.objects.create()
    room.participants.add(request.user, other_user)
    return redirect('chat_room', room_id=room.id)



@login_required
def chat_room(request, room_id):
    room = ChatRoom.objects.get(id=room_id)
    messages = Message.objects.filter(room=room).order_by("timestamp")
    
    coordinators_group = Group.objects.get(name="xraycoordinator")
    coordinators = coordinators_group.user_set.all()
    
    return render(request, "chat_widget.html", {
        "room": room,
        "chat_messages": messages,
        "current_user": request.user.username,
        "coordinators": coordinators,  
    })



@login_required
def coordinator_dashboard(request):
    user = request.user

    messages = (
        Message.objects
        .select_related("room", "sender", "tagged_user")
        .order_by("room_id", "timestamp")
    )

    allowed_room_ids = set()
    is_tagged_in_room = {}
    
    first_message_by_room = {}

    for msg in messages:
        room_id = msg.room_id

        if room_id not in first_message_by_room and msg.sender.username.lower() != "systembot":
            first_message_by_room[room_id] = msg
        
        if msg.tagged_user == user:
            allowed_room_ids.add(room_id)
            is_tagged_in_room[room_id] = True
    
    print("Is tagged in room:", is_tagged_in_room)

    for room_id, first_msg in first_message_by_room.items():
        if not first_msg.tagged_user:
            allowed_room_ids.add(room_id)

    filtered_messages = [msg for msg in messages if msg.room_id in allowed_room_ids]

    from collections import defaultdict
    room_messages = defaultdict(list)
    room_latest_timestamp = {}

    for msg in filtered_messages:
        room_id = msg.room.id
        room_messages[room_id].append(msg)
        room_latest_timestamp[room_id] = msg.timestamp

    sorted_room_messages = {}
    for room_id, msgs in sorted(
        room_messages.items(),
        key=lambda item: room_latest_timestamp[item[0]],
        reverse=True
    ):
        room = ChatRoom.objects.get(id=room_id)
        sorted_room_messages[room_id] = {
            "messages": msgs,
            "is_closed": room.is_closed,
            "is_for_you": is_tagged_in_room.get(room_id, False)
        }

    return render(request, "support_chat/coordinator_dashboard.html", {
        "room_messages": sorted_room_messages
    })


def get_or_create_room(request, other_user_id):
    room = ChatRoom.objects.filter(participant1=request.user, participant2_id=other_user_id).first()
    if not room:
        room = ChatRoom.objects.create(participant1=request.user, participant2_id=other_user_id)
    return redirect(f'/support_chat/coordinator-dashboard/')


def room_view(request, room_id):
    return render(request, "room.html", {
        "room_id": room_id,
    })



@login_required
def recent_messages(request, room_id):
    messages = Message.objects.filter(room_id=room_id).order_by('-timestamp')[:20]
    messages = reversed(messages)  

    context = {
        "room_id": room_id,
        "messages": messages,
    }
    return render(request, "chat_recent.html", context)




def get_chat_messages(request, room_id):
    try:
        room = ChatRoom.objects.get(id=room_id)
        messages = Message.objects.filter(room=room).order_by("timestamp")

        return JsonResponse({
            "is_closed": room.is_closed,
            "messages": [
                {
                    "message": m.content,
                    "sender": m.sender.username,
                    "timestamp": m.timestamp.isoformat(), 
                    "file_urls": [request.build_absolute_uri(f"/serve-file/{m.file}")] if m.file else []


                } for m in messages
            ]
        })
    except ChatRoom.DoesNotExist:
        return JsonResponse({"error": "Room not found"}, status=404)



def serve_chat_file(request, key):
    s3 = boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION
    )
    
    bucket = settings.AWS_STORAGE_BUCKET_NAME
    key = unquote(key)  

    try:
        presigned_url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket, 'Key': key},
            ExpiresIn=3600
        )
        return HttpResponseRedirect(presigned_url) 
    except ClientError:
        raise Http404("File not found")




@login_required
def recent_chats(request):
    rooms = ChatRoom.objects.filter(
        is_closed=True,
        participant1=request.user
    ) | ChatRoom.objects.filter(
        is_closed=True,
        participant2=request.user
    )
    return render(request, 'support_chat/recent_chats.html', {'rooms': rooms})



@login_required
def start_new_chat_api(request):
    if request.method == "POST":
        room = ChatRoom.objects.create(
            participant1=request.user
        )
        return JsonResponse({"room_id": room.id})
    return JsonResponse({"error": "Invalid request"}, status=400)





from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def close_room(room_id, sender="Support"):
    room = ChatRoom.objects.get(id=room_id)
    room.is_closed = True
    room.save()

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"chat_{room_id}",
        {
            "type": "chat_closed",
            "sender": sender
        }
    )




@login_required
def chat_page(request):
    room_id = request.GET.get("room_id")

    if room_id:
        room = ChatRoom.objects.filter(
            id=room_id,
            participants__in=[request.user],  
            is_closed=False
        ).first()
    else:
        room = ChatRoom.objects.filter(
            participants__in=[request.user],
            is_closed=False
        ).order_by('-id').first()

    messages = Message.objects.filter(room=room).order_by("timestamp") if room else []

    return render(request, 'chat_widget.html', {
        "room": room,
        "chat_messages": messages,
        "current_user": request.user.username
    })



from django.contrib.auth.models import User, Group
from django.http import JsonResponse

def get_coordinators(request):
    coordinators_group = Group.objects.get(name="xraycoordinator")
    coordinators = User.objects.filter(groups=coordinators_group)
    return JsonResponse([{"id": c.id, "username": c.username} for c in coordinators], safe=False)



def send_message(request, room_id):
    if request.method == "POST":
        room = get_object_or_404(ChatRoom, id=room_id)
        sender = request.user
        content = request.POST.get("content", "").strip()

        if not room.assigned_coordinator and sender == room.participant1:
            match = re.search(r"@(\w+)", content)
            if match:
                username = match.group(1)
                try:
                    coordinator = User.objects.get(username=username)
                    room.assigned_coordinator = coordinator
                    room.save()
                except User.DoesNotExist:
                    return JsonResponse({"error": "Coordinator not found"}, status=400)

        message = Message.objects.create(room=room, sender=sender, content=content)

        return JsonResponse({
            "sender": sender.username,
            "content": message.content,
            "timestamp": message.timestamp.isoformat()
        })


@login_required
def get_user_open_room(request):
    latest_room = ChatRoom.objects.filter(
        Q(participant1=request.user) | Q(participant2=request.user)
    ).order_by('-created_at').first()

    if latest_room and not latest_room.is_closed:
        return JsonResponse({"room_id": latest_room.id})

    return JsonResponse({"room_id": None})



from django.http import JsonResponse

@login_required
def recent_chats_api(request):
    N = 5
    recent_rooms = ChatRoom.objects.filter(
        Q(participant1=request.user) | Q(participant2=request.user),
        is_closed=True
    ).order_by('-created_at')[:N]
    return JsonResponse({
        "recent_rooms": [{"id": room.id, "created_at": room.created_at.isoformat()} for room in recent_rooms]
    })






@csrf_exempt
@require_POST
@login_required 
def send_files(request, room_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST allowed'}, status=405)

    files = request.FILES.getlist('files')
    file_urls = []

    s3 = boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION
    )

    room = ChatRoom.objects.get(id=room_id)

    for file in files:
        filename = f"chat_files/{room_id}/{file.name}"

        s3.upload_fileobj(
            file,
            settings.AWS_STORAGE_BUCKET_NAME,
            filename,
            ExtraArgs={
                'ContentType': file.content_type,
                'ACL': 'private'
            }
        )

        msg = Message.objects.create(
            room=room,
            sender=request.user,  
            content="[File Uploaded]",
            file=filename
        )

        url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': settings.AWS_STORAGE_BUCKET_NAME, 'Key': filename},
            ExpiresIn=3600
        )
        file_urls.append(url)

        serve_url = request.build_absolute_uri(f"/serve-file/{filename}")


        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
        f"chat_{room_id}",
        {
                "type": "chat_message",  
                "message": "[File Uploaded]", 
                "sender": request.user.username,
                "timestamp": msg.timestamp.isoformat(),
                "file_urls": [serve_url]
        }
        )
    return JsonResponse({'file_urls': file_urls})


@csrf_exempt
def close_chat_room(request, room_id):
    if request.method == "POST":
        try:
            room = ChatRoom.objects.get(id=room_id)
            room.is_closed = True
            room.save()
            print(f"Room {room_id} closed")

            return JsonResponse({"status": "success"})
        except ChatRoom.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Room not found"}, status=404)
