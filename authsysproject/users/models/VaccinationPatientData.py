from django.db import models

class vaccinationPatientDetails(models.Model):
    PatientId = models.CharField(max_length=50, null=True)
    PatientName = models.CharField(max_length=70, null=True)
    age = models.CharField(max_length=50, null=True)
    gender = models.CharField(max_length=50, null=True)
    Hepatitis_E_Batch_No = models.CharField(max_length=50, null=True)
    Hepatitis_E_Manufacturing_Date = models.CharField(max_length=50, null=True)
    Hepatitis_E_Expiry_Date = models.CharField(max_length=50, null=True)
    Typhoid_Batch_No = models.CharField(max_length=50, null=True)
    Typhoid_Manufacturing_Date = models.CharField(max_length=50, null=True)
    Typhoid_Expiry_Date = models.CharField(max_length=50, null=True)
    Date= models.CharField(max_length=50, null=True)

    def _str_(self):
        return self.PatientId