from django.db import models
from .personalinfo import PersonalInfo
from .Xray_Location import XLocation
from storages.backends.s3boto3 import S3Boto3Storage



class DICOMData(models.Model):
    patient_name = models.CharField(max_length=250, blank=True)
    patient_id = models.CharField(max_length=250, blank=True)
    age = models.CharField(max_length=250, blank=True)
    gender = models.CharField(max_length=250, blank=True)
    study_date = models.CharField(max_length=250, blank=True)
    study_id = models.CharField(max_length=100, blank=True)
    study_description = models.CharField(max_length=200, blank=True)
    isDone = models.BooleanField(default=False)
    NonReportable = models.BooleanField(default=False)
    notes = models.CharField(max_length=50000, default=True)
    location = models.ForeignKey(XLocation, on_delete=models.CASCADE, null=True, blank=True)
    radiologist = models.ManyToManyField(PersonalInfo, blank=True)
    body_part_examined = models.CharField(max_length=200, blank=True, null=True)
    accession_number = models.CharField(max_length=50, null=True, blank=True)

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
