from rest_framework.serializers import ModelSerializer
import rest_framework.serializers as serializers
from .models import *
from server_django.serializer import UserGetSerializer

class EmployeeGETSerializer(ModelSerializer):
    user = UserGetSerializer(required=True)
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

class TimeSheetGETSerializer(ModelSerializer):
    employee = EmployeeGETSerializer(required=True)
    class Meta:
        model = TimeSheet
        fields = '__all__'

class TimeSheetPOSTSerializer(ModelSerializer):
    employee = serializers.IntegerField(allow_null=False)
    class Meta:
        model = TimeSheet
        fields = '__all__'
    def validate_employee(self,value):
        employee_query = Employees.objects.filter(id = value)
        if len(employee_query) > 0:
            return value
        raise serializers.ValidationError("Employee id is not valid.")

class TimeSheetPUTSerializer(ModelSerializer):
    employee = serializers.IntegerField(allow_null=False)
    date = serializers.DateTimeField(required = False)
    class Meta:
        model = TimeSheet
        fields = '__all__'

    def validate_employee(self,value):
        employee_query = Employees.objects.filter(id = value)
        if len(employee_query) > 0:
            return value
        raise serializers.ValidationError("Employee id is not valid.")

class TimeSheetDELETESerializer(ModelSerializer):
    class Meta:
        model = TimeSheet
        fields = '__all__'

class LineItemsGETSerializer(ModelSerializer):
    timesheet = TimeSheetGETSerializer(required = True)
    class Meta:
        model = LineItems
        fields = '__all__'

class LineItemsPOSTSerializer(ModelSerializer):
    class Meta:
        model = LineItems
        fields = '__all__'

class LineItemsPUTSerializer(ModelSerializer):
    class Meta:
        model = LineItems
        fields = '__all__'
        
class LineItemsDELETESerializer(ModelSerializer):
    class Meta:
        model = LineItems
        fields = '__all__'
