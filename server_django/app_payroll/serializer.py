from rest_framework.serializers import ModelSerializer
from .models import *
class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
class EmployeeGETSerializer(ModelSerializer):
    class Meta:
        model = Employees
        fields = ('id', 'name')
class EmployeePOSTSerializer(ModelSerializer):
    class Meta:
        model = Employees
        fields = ('field_1', 'field_3', 'field_2')
class EmployeePUTSerializer(ModelSerializer):
    class Meta:
        model = Employees
        fields = ('field_1', 'field_10')
class EmployeeDELETESerializer(ModelSerializer):
    class Meta:
        model = Employees
        fields = ('field_1', 'field_10')