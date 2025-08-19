from django.db import models
from .Client import Institution # import your existing models
from .personalinfo import PersonalInfo

class RadiologistInstitutionRestriction(models.Model):
    radiologist = models.ForeignKey(
        PersonalInfo,
        on_delete=models.CASCADE,
        related_name="restricted_institutions"
    )  
    institutions = models.ManyToManyField(
        Institution,
        related_name="restricted_radiologists"
    )

    class Meta:
        unique_together = ("radiologist",)  # prevents duplicate radiologist rows

    def __str__(self):
        return f"{self.radiologist.user.username} restricted in {self.institutions.count()} institution(s)"