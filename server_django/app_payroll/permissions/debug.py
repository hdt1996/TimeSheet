from rest_framework import permissions

EMPLOYEE_PERMISSION = permissions.AllowAny
LINE_ITEM_PERMISSION = permissions.AllowAny
TIMESHEET_PERMISSION = permissions.AllowAny


def getEmployeeByUser(request) -> None:
    return None