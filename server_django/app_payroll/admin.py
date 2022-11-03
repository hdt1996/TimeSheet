from django.contrib import admin
from .models import *

admin.site.register(Employees)
admin.site.register(Billables)
admin.site.register(BillLineItem)

# Register your models here.
