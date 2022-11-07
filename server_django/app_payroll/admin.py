from django.contrib import admin
from .models import *

admin.site.register(Employees)
admin.site.register(TimeSheet)
admin.site.register(LineItems)

# Register your models here.
