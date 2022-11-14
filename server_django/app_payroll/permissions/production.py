from rest_framework import permissions, status
from rest_framework.response import Response
from app_payroll.models import Employees

EMPLOYEE_PERMISSION = permissions.IsAdminUser
LINE_ITEM_PERMISSION = permissions.IsAuthenticated
TIMESHEET_PERMISSION = permissions.IsAuthenticated


def getEmployeeByUser(request) -> Employees:
    if request.user.is_superuser:
        return None
    employee_query = Employees.objects.filter(user = request.user.id)
    if len(employee_query) == 0:
        return Response({'Error':'No associated employee account for user'}, status = status.HTTP_403_FORBIDDEN)
    return employee_query[0]
