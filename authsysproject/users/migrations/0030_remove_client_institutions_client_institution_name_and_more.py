# Generated by Django 5.1.3 on 2025-03-22 14:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0029_institution_remove_client_institution_name_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='client',
            name='institutions',
        ),
        migrations.AddField(
            model_name='client',
            name='institution_name',
            field=models.CharField(blank=True, default='None', max_length=250, null=True),
        ),
        migrations.DeleteModel(
            name='Institution',
        ),
    ]
