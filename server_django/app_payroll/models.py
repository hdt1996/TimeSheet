from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

class Employees(models.Model): #Summary: Table in PSQL database containing employees
    
    # Static methods required by django for uploading files/documents to custom directory
    # Declared inside scope of this class for legibility
    
    def photoToUserDir(instance, file: str):
        return f'media/{instance.user.id}_{instance.user.username}/{file}'
    def onboard_docsToUserDir(instance, file: str):
        return f'media/{instance.user.id}_{instance.user.username}/{file}'
        
    # Instantiated methods to be used in views/API. For validation or other utilities

    def photoToUrl(self):
        try:
            url=str(self.photo.url)
        except:
            url=None
        return url
    def validatephotoSize(self,value):
        filesize= value.size
        max_size = 100000000.0
        if filesize > max_size:
            raise ValidationError(f"The maximum size of uploading to photo is {max_size/10**6} mb.")
        else:
            return value
    def onboard_docsToUrl(self):
        try:
            url=str(self.onboard_docs.url)
        except:
            url=None
        return url
    def validateonboard_docsSize(self,value):
        filesize= value.size
        max_size = 100000000.0
        if filesize > max_size:
            raise ValidationError(f"The maximum size of uploading to onboard_docs is {max_size/10**6} mb.")
        else:
            return value
            
    #id = models.IntegerField(null=False, blank=False, default=0, primary_key = True)
    # This field is not necessary since Django autocreates id field in PSQL database
    
    hourly = models.BooleanField(default=False, null = False, blank=False)
    name = models.TextField(max_length=50, null=True, blank=True, default=None)
    department = models.TextField(max_length=50, null=True, blank=True, default='')
    pay_rate = models.DecimalField(null=True, blank=True, default=None, max_digits=10,decimal_places=2)
    photo = models.ImageField(null=True, blank=True, upload_to= photoToUserDir) #custom uploaded to media folder. Filesize validation will be called on view
    onboard_docs = models.FileField(null=True, blank=True, upload_to= onboard_docsToUserDir) #custom uploaded to media folder. Filesize validation will be called on view
    user = models.ForeignKey(User, on_delete=models.PROTECT, blank=True, null=True)
    class Meta:
        verbose_name = 'Employee'
        verbose_name_plural = 'Employees'
        app_label = 'app_payroll'

class Timesheet(models.Model):

    employee = models.ForeignKey(Employees, on_delete=models.PROTECT, blank=True, null=True )
    start_diff = models.DecimalField(null=True, blank=True, default=None, max_digits=4,decimal_places=2) #in minutes
    end_diff = models.DecimalField(null=True, blank=True, default=None, max_digits=4,decimal_places=2) #in minutes
    clock_in = models.DateTimeField(auto_now_add=True, auto_now=False) #automatically added on POST, remaining times will be updated on PUT
    lunch_in = models.DateTimeField()
    lunch_out = models.DateTimeField()
    clockout = models.DateTimeField()

    def validatelateLength(self, length: int = 10):
        if len(str(self.late)) > length:
            return False
        else:
            return True
    class Meta:
        verbose_name = 'Timesheet'
        verbose_name_plural = 'Timesheet'
        app_label = 'app_payroll'

