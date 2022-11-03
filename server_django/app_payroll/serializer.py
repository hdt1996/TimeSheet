from rest_framework.serializers import ModelSerializer
from .models import *

class EmployeeGETSerializer(ModelSerializer):
    class Meta:
        model = Employees
        fields = '__all__'
class EmployeePOSTSerializer(ModelSerializer):
    class Meta:
        model = Employees
        fields = '__all__'
class EmployeePUTSerializer(ModelSerializer):
    class Meta:
        model = Employees
        fields = '__all__'
class EmployeeDELETESerializer(ModelSerializer):
    class Meta:
        model = Employees
        fields = '__all__'

class BillablesGETSerializer(ModelSerializer):
    class Meta:
        model = Employees
        fields = '__all__'
class BillablesPOSTSerializer(ModelSerializer):
    class Meta:
        model = Employees
        fields = '__all__'
class BillablesPUTSerializer(ModelSerializer):
    class Meta:
        model = Employees
        fields = '__all__'
class BillablesDELETESerializer(ModelSerializer):
    class Meta:
        model = Employees
        fields = '__all__'