# Generated by Django 5.1.3 on 2025-02-26 10:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0024_vitalpatientdetails_abdomen_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='personalinfo',
            name='uploadpicture',
            field=models.ImageField(blank=True, null=True, upload_to='static/profile_pictures/'),
        ),
    ]
