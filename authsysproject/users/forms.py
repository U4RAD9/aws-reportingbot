from django import forms
from multiupload.fields import MultiFileField
from .models.DICOMData import DICOMData
from .models.EcgPdfReport import EcgReport
from .models.XrayPdfReport import XrayReport
from .models.personalinfo import PersonalInfo
from django.contrib.auth.models import User


class DICOMDataForm(forms.ModelForm):
    dicom_file = MultiFileField(min_num=1, max_num=10, max_file_size=1024 * 1024 * 25)
    class Meta:
        model = DICOMData
        fields = ['dicom_file']
class EcgReportForm(forms.ModelForm):
    class Meta:
        model = EcgReport
        fields = ['pdf_file']



class XrayReportForm(forms.ModelForm):
    class Meta:
        model = XrayReport
        fields = ['pdf_file']


class PersonalInfoForm(forms.ModelForm):
    class Meta:
        model = PersonalInfo
        fields = ['user', 'signature', 'companylogo']
        widgets = {
            'user': forms.Select(),  # This creates a dropdown for users
        }
