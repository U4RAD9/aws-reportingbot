# Generated by Django 5.1.3 on 2025-04-22 08:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0036_xrayreport_pdf_on_db'),
    ]

    operations = [
        migrations.AlterField(
            model_name='xrayreport',
            name='pdf_on_db',
            field=models.TimeField(blank=True, null=True),
        ),
    ]
