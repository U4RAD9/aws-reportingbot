from django.urls import path
from .views import ReportingBotView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('reporting-bot', ReportingBotView.as_view(), name="reportingbot"),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
