from django import forms
from multiupload.fields import MultiFileField
from .models.DICOMData import DICOMData
from .models.EcgPdfReport import EcgReport
from .models.XrayPdfReport import XrayReport
from .models.personalinfo import PersonalInfo
from django.contrib.auth.models import User
from .models.Location import Location
from .models.faq import FAQ
from .models.patientdetails import PatientDetails
from .models.DICOMData import DICOMData, PatientHistoryFile
from django.forms import inlineformset_factory
from django.forms.widgets import DateInput, TimeInput

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


class ECGUploadForm(forms.Form):
    ecg_file = MultiFileField(min_num=1, max_num=50, max_file_size=1024 * 1024 * 5)
    location = forms.ModelChoiceField(queryset=Location.objects.all(), label="Select Location", required=True)






class FAQForm(forms.ModelForm):
    class Meta:
        model = FAQ
        fields = ['question', 'answer', 'target_group']
        widgets = {
            'question': forms.TextInput(attrs={'class': 'form-control'}),
            'answer': forms.Textarea(attrs={'class': 'form-control'}),
            'target_group': forms.Select(attrs={'class': 'form-select'}),
        }





class PatientDetailsForm(forms.ModelForm):
    class Meta:
        model = PatientDetails
        fields = ['PatientId', 'PatientName', 'age', 'gender', 'HeartRate', 'PRInterval', 'image']
        widgets = {
            'gender': forms.Select(choices=PatientDetails.GENDER_CHOICES),
        }


# ----------------------------------------------
# UPDATED FOREIGN CLIENT FORM (REQUESTED CHANGE)
# ----------------------------------------------
class DICOMDataFormFOREIGNCLIENT(forms.ModelForm):

    gender = forms.ChoiceField(
        choices=[("Male", "Male"), ("Female", "Female"), ("Other", "Other")],
        widget=forms.Select(attrs={'class': 'form-select'})
    )

    Modality = forms.CharField(
        widget=forms.TextInput(attrs={
            'list': 'modality_list',
            'class': 'form-control',
            'placeholder': 'Select or type Modality'
        })
    )

    institution_name = forms.CharField(
        widget=forms.TextInput(attrs={
            'list': 'institution_list',
            'class': 'form-control',
            'placeholder': 'Select or type Institution Name'
        })
    )

    body_part_examined = forms.CharField(
        widget=forms.TextInput(attrs={
            'list': 'body_part_examined_list',
            'class': 'form-control',
            'placeholder': 'Select or type Institution Name'
        })
    )
    

    class Meta:
        model = DICOMData
        fields = [
            "patient_name", "patient_id", "age", "gender", "study_date", "study_time",
            "Modality", "study_description", "body_part_examined",
            "institution_name", "notes"
        ]
        widgets = {
            "study_date": DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            "study_time": TimeInput(attrs={'type': 'time', 'class': 'form-control'}),
            "patient_name": forms.TextInput(attrs={'class': 'form-control'}),
            "patient_id": forms.TextInput(attrs={'class': 'form-control'}),
            "age": forms.NumberInput(attrs={'class': 'form-control'}),
            "study_description": forms.TextInput(attrs={'class': 'form-control'}),
            "body_part_examined": forms.TextInput(attrs={'class': 'form-control'}),
            "notes": forms.Textarea(attrs={'class': 'form-control'}),
        }


# Inline Formset for multiple history files
PatientHistoryFileFormSet = inlineformset_factory(
    DICOMData,
    PatientHistoryFile,
    fields=["history_file"],
    extra=3,
    can_delete=False
)