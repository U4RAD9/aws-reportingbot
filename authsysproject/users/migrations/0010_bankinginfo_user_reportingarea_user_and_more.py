# Generated by Django 5.1.3 on 2024-12-20 08:09

import django.db.models.deletion
import storages.backends.s3
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0009_alter_dicomdata_recived_on_db'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='bankinginfo',
            name='user',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='reportingarea',
            name='user',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='timeavailability',
            name='user',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='bankinginfo',
            name='acnumber',
            field=models.CharField(blank=True, max_length=15, null=True),
        ),
        migrations.AlterField(
            model_name='bankinginfo',
            name='bankname',
            field=models.CharField(blank=True, max_length=25, null=True),
        ),
        migrations.AlterField(
            model_name='bankinginfo',
            name='cheque',
            field=models.FileField(storage=storages.backends.s3.S3Storage(), upload_to='uploads/'),
        ),
        migrations.AlterField(
            model_name='bankinginfo',
            name='ifsc',
            field=models.CharField(blank=True, max_length=15, null=True),
        ),
        migrations.AlterField(
            model_name='bankinginfo',
            name='pancardno',
            field=models.CharField(blank=True, max_length=15, null=True),
        ),
        migrations.AlterField(
            model_name='bankinginfo',
            name='pandcard',
            field=models.FileField(storage=storages.backends.s3.S3Storage(), upload_to='uploads/'),
        ),
        migrations.AlterField(
            model_name='bankinginfo',
            name='pictureproof',
            field=models.FileField(storage=storages.backends.s3.S3Storage(), upload_to='uploads/'),
        ),
        migrations.AlterField(
            model_name='personalinfo',
            name='resume',
            field=models.FileField(blank=True, default=None, null=True, storage=storages.backends.s3.S3Storage(), upload_to='uploads/'),
        ),
        migrations.AlterField(
            model_name='personalinfo',
            name='uploadpicture',
            field=models.FileField(blank=True, default=None, null=True, storage=storages.backends.s3.S3Storage(), upload_to='uploads/'),
        ),
        migrations.AlterField(
            model_name='qualificationdetails',
            name='mbbsdegree',
            field=models.FileField(blank=True, null=True, storage=storages.backends.s3.S3Storage(), upload_to='uploads/'),
        ),
        migrations.AlterField(
            model_name='qualificationdetails',
            name='mbbsgrade',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='qualificationdetails',
            name='mbbsinstitution',
            field=models.CharField(blank=True, max_length=25, null=True),
        ),
        migrations.AlterField(
            model_name='qualificationdetails',
            name='mbbsmarksheet',
            field=models.FileField(blank=True, null=True, storage=storages.backends.s3.S3Storage(), upload_to='uploads/'),
        ),
        migrations.AlterField(
            model_name='qualificationdetails',
            name='mbbspsyr',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='qualificationdetails',
            name='mddegree',
            field=models.FileField(blank=True, null=True, storage=storages.backends.s3.S3Storage(), upload_to='uploads/'),
        ),
        migrations.AlterField(
            model_name='qualificationdetails',
            name='mdgrade',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='qualificationdetails',
            name='mdinstitution',
            field=models.CharField(blank=True, max_length=25, null=True),
        ),
        migrations.AlterField(
            model_name='qualificationdetails',
            name='mdpsyr',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='qualificationdetails',
            name='tencertificate',
            field=models.FileField(blank=True, null=True, storage=storages.backends.s3.S3Storage(), upload_to='uploads/'),
        ),
        migrations.AlterField(
            model_name='qualificationdetails',
            name='tengrade',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='qualificationdetails',
            name='tenpsyr',
            field=models.CharField(blank=True, max_length=15, null=True),
        ),
        migrations.AlterField(
            model_name='qualificationdetails',
            name='tensname',
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
        migrations.AlterField(
            model_name='qualificationdetails',
            name='twelvecertificate',
            field=models.FileField(blank=True, null=True, storage=storages.backends.s3.S3Storage(), upload_to='uploads/'),
        ),
        migrations.AlterField(
            model_name='qualificationdetails',
            name='twelvegrade',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='qualificationdetails',
            name='twelvepsyr',
            field=models.CharField(blank=True, max_length=15, null=True),
        ),
        migrations.AlterField(
            model_name='qualificationdetails',
            name='twelvesname',
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
        migrations.AlterField(
            model_name='reportingarea',
            name='ctopt',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='reportingarea',
            name='ctothers',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='reportingarea',
            name='mriopt',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='reportingarea',
            name='mriothers',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='reportingarea',
            name='others',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='reportingarea',
            name='xray',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='timeavailability',
            name='friday',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='timeavailability',
            name='monday',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='timeavailability',
            name='saturday',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='timeavailability',
            name='sunday',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='timeavailability',
            name='thursday',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='timeavailability',
            name='tuesday',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='timeavailability',
            name='wednesday',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='workexp',
            name='regcecr',
            field=models.FileField(blank=True, null=True, storage=storages.backends.s3.S3Storage(), upload_to='uploads/'),
        ),
    ]
