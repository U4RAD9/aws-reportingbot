# Generated by Django 5.1.3 on 2025-02-06 11:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0019_alter_patienthistoryfile_history_file_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='StudyReport',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('study_id', models.CharField(max_length=255, unique=True)),
                ('editor_content', models.TextField(blank=True, null=True)),
            ],
        ),
    ]
