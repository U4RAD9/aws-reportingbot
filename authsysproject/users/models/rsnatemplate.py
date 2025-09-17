from django.db import models

class RSNATemplate(models.Model):
    name = models.CharField(max_length=1000)
    content = models.TextField()

    def __str__(self):
        return self.name