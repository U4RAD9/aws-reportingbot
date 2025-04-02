from django.db import models
from django.contrib.auth.models import User
from .Xray_Location import XLocation


class Institution(models.Model):
    name = models.CharField(max_length=250, unique=True)

    def __str__(self):
        return self.name


class Client(models.Model):
    user = models.OneToOneField(User, null=True, on_delete=models.CASCADE, blank=True)
    name = models.CharField(max_length=100, null=True, blank=True)
    email = models.EmailField(unique=True, null=True, blank=True)
    password = models.CharField(max_length=100, null=True, blank=True)
    location = models.ForeignKey(XLocation, on_delete=models.CASCADE, null=True, blank=True)
    #institution_name = models.CharField(max_length=250, blank=True, null=True, default="None")
    institutions = models.ManyToManyField(Institution, blank=True)  # 🔹 Updated to ManyToManyField
    tbclient = models.BooleanField(default=False)

    # Field-level permissions for editable fields
    can_edit_patient_name = models.BooleanField(default=False)
    can_edit_patient_id = models.BooleanField(default=False)
    can_edit_age = models.BooleanField(default=False)
    can_edit_gender = models.BooleanField(default=False)
    can_edit_study_date = models.BooleanField(default=False)
    can_edit_study_description = models.BooleanField(default=False)
    can_edit_notes = models.BooleanField(default=False)
    can_edit_body_part_examined = models.BooleanField(default=False)
    can_edit_referring_doctor_name = models.BooleanField(default=False)
    can_edit_whatsapp_number = models.BooleanField(default=False)
    upload_header = models.ImageField(upload_to='headers/', null=True, blank=True)
    upload_footer = models.ImageField(upload_to='footers/', null=True, blank=True)

    def __str__(self):
        return self.name
