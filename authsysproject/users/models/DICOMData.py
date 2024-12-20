from django.db import models
from .personalinfo import PersonalInfo
from .Xray_Location import XLocation
from storages.backends.s3boto3 import S3Boto3Storage
from django.utils.timezone import now



class DICOMData(models.Model):
    patient_name = models.CharField(max_length=250, blank=True)
    patient_id = models.CharField(max_length=250, blank=True)
    age = models.CharField(max_length=250, blank=True)
    gender = models.CharField(max_length=250, blank=True)
    study_date = models.CharField(max_length=250, blank=True)
    study_time = models.TimeField(max_length=250, blank=True, null=True)
    recived_on_orthanc = models.TimeField(max_length=250, blank=True, null=True)
    recived_on_db = models.DateTimeField(auto_now_add=True, null=True)
    Modality = models.CharField(max_length=250, blank=True, null=True)
    study_id = models.CharField(max_length=100, blank=True)
    study_description = models.CharField(max_length=200, blank=True)
    isDone = models.BooleanField(default=False)
    NonReportable = models.BooleanField(default=False)
    notes = models.TextField(max_length=50000, default=True)
    #location = models.ForeignKey(XLocation, on_delete=models.CASCADE, null=True, blank=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    radiologist = models.ManyToManyField(PersonalInfo, blank=True)
    body_part_examined = models.CharField(max_length=200, blank=True, null=True)
    #accession_number = models.CharField(max_length=50, null=True, blank=True)
    institution_name = models.CharField(max_length=250, blank=True, null=True, default="None")
    referring_doctor_name = models.CharField(max_length=250, blank=True, null=True, default="None")
    whatsapp_number = models.CharField(max_length=10, blank=True, null=True)


    def save(self, *args, **kwargs):
        if not self.recived_on_db:  # Set the timestamp only if it isn't already set
            self.recived_on_db = now()
        super(DICOMData, self).save(*args, **kwargs)

    def __str__(self):
        return str(self.patient_name)




class DICOMFile(models.Model):
    dicom_data = models.ForeignKey(DICOMData, related_name='dicom_files', on_delete=models.CASCADE)
    dicom_file = models.FileField(upload_to='dicom_files/', storage=S3Boto3Storage())
    #dicom_file = models.CharField(max_length=500)

class JPEGFile(models.Model):
    dicom_data = models.ForeignKey(DICOMData, related_name='jpeg_files', on_delete=models.CASCADE)
    jpeg_file = models.ImageField(upload_to='jpeg_files/', storage=S3Boto3Storage())
    #jpeg_file = models.CharField(max_length=500)


class PatientHistoryFile(models.Model):
    dicom_data = models.ForeignKey(DICOMData, related_name='history_files', on_delete=models.CASCADE)
    history_file = models.FileField(upload_to='patient_history_files/',storage=S3Boto3Storage(),help_text="Upload patient history files (PDF, JPEG, PNG).")
    uploaded_at = models.DateTimeField(auto_now_add=True)    
