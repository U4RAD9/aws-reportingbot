from django.db import models
from django.contrib.auth.models import User

class FAQ(models.Model):
    TARGET_GROUPS = [
        ('xraycoordinator', 'Xray Coordinator'),
        ('radiologist', 'Radiologist'),
        ('client', 'Client'),
    ]

    question = models.CharField(max_length=255)
    answer = models.TextField()
    target_group = models.CharField(max_length=20, choices=TARGET_GROUPS)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.question
