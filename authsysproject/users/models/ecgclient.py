from django.db import models
from django.contrib.auth.models import User
from .Location import Location
class ECGClient(models.Model): 
    user = models.OneToOneField(User, null=True, on_delete=models.CASCADE, blank=True) 
    name = models.CharField(max_length=100, null=True, blank=True) 
    email = models.EmailField(unique=True, null=True, blank=True) 
    password = models.CharField(max_length=100, null=True, blank=True) 
    location = models.ForeignKey(Location, on_delete=models.CASCADE, null=True, blank=True)