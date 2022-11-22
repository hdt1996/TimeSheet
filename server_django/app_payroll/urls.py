"""server_django URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
import os
if os.environ.get("DEBUG"): #We need both for running manage.py commands such as static collection or migrations
    from .views.debug import *
else:
    from .views.prod import *

urlpatterns = [
    path('employees/',EmployeeAdminView.as_view()),
    path('timesheet/',TimeSheetView.as_view()),
    path('timesheet/lineitems/',LineItemsView.as_view())
]
