from rest_framework import status
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer
from .models import *
import json

QUERY_OPTIONS = \
{
    'greater':'__gt',
    'greater-equal':'__gte',
    'lesser':'__lt',
    'lesser-equal':'__lte',
    'startswith':'__startswith',
    'contains':'__contains',
    'in':'__in',
    'equal':''
}

def processSelectors(request, fixed_selectors: dict, allowed_fields: dict):

    if request.headers.get('selectors') == None:
        return Response({'Error':'No Search Parameters passed in'}, status = status.HTTP_403_FORBIDDEN)
    try:
        selectors =  json.loads(request.headers.get('selectors')) #Fetch options should contain 'selectors' key with value being dictionary --> example {'operator':'greater','value':10}
    except:
        # request header's 'selectors' should be JSON parsable to dictionary.
        return Response({}, status = status.HTTP_403_FORBIDDEN) 

    if len(selectors) == 0:
        return Response({}, status = status.HTTP_403_FORBIDDEN) # return empty JSON object if selectors is empty. To prevent too large of a query if there is only fixed_selectors which may be broad in scope

    for field in selectors:
        if field in fixed_selectors: # if any field in selectors matches those in fixed_selectors, this is not allowed. Only fields not matching keys in fixed_selectors pass this
            return Response({'Error':'Custom field passed into non-custom field'}, status = status.HTTP_403_FORBIDDEN)
        if field not in allowed_fields and allowed_fields != "*":
            return Response({'Error':'Disallowed field passed in'}, status = status.HTTP_403_FORBIDDEN)

    return selectors

def processGetResponse(serialized: ModelSerializer, response_fields: dict):
    if response_fields == "*":
        return Response(serialized.data, status = status.HTTP_200_OK)

    response_data = []
    for entry in serialized.data:
        obj_dict = {}
        for key in response_fields: # We use self.response_fields to filter through data to only select only the entry properties that we want shown
            obj_dict[key] = entry[key]
        response_data.append(obj_dict)
    return Response(response_data, status = status.HTTP_200_OK)

def buildQuery(selectors: dict, fixed_selectors: dict) -> dict:
    sel_dict = {} # initialize kwargs object to use in Django's table.objects.filter(**kwargs). Will be using ORM statements from QUERY_OPTIONS global
    for field in fixed_selectors: #Set up fixed queries to add to sel_dict
        oper = fixed_selectors[field]['operator']
        value = fixed_selectors[field]['value']
        sel_dict[f"{field}{QUERY_OPTIONS[oper]}"] = value # Key per django docs needs to have field name first and then query_options, i.e. {"field_1__gt":5} then converted to arg objects.filter(field_1__gt=5)
    
    for field in selectors:
        oper = selectors[field]['operator']
        value = selectors[field]['value']
        if oper in QUERY_OPTIONS:
            sel_dict[f"{field}{QUERY_OPTIONS[oper]}"] = value
    return sel_dict

def limitTimesheetAccess(request, sel_dict:dict, field: str = 'employee') -> dict:
    if request.user.is_superuser:
        return sel_dict
    employee_query = Employees.objects.filter(user = request.user)
    if len(employee_query) == 0:
        return Response({'Error':'No associated employee account for user'}, status = status.HTTP_403_FORBIDDEN)
    sel_dict[field] = employee_query[0].id
    return sel_dict

def limitTimesheetDelete(request, sel_dict:dict) -> dict:
    if request.user.is_superuser:
        return sel_dict
    employee_query = Employees.objects.filter(user = request.user)
    if len(employee_query) == 0:
        return Response({'Error':'No associated employee account for user'}, status = status.HTTP_403_FORBIDDEN)

    id = sel_dict['id__in'] #These are line item ids
    if not isinstance(id, list):
        id = [id]

    if len(id) == 0:
        return Response({'Error':'Attempt to bypass ID limitation in query'}, status = status.HTTP_403_FORBIDDEN)
        
    for i in id:
        if not TimeSheet.objects.filter(employee = employee_query[0].id, id=i).exists():
            return Response({'Error':'Attempt to access timesheet not existing for user/employee'}, status = status.HTTP_403_FORBIDDEN)
    return sel_dict

def limitLineItemAccess(request, sel_dict:dict) -> dict: 
    #When getting line items, they are restricted to the timesheet that is assigned for the user
    #When timesheet is missing or does not have a match for query below, return Error response
    if request.user.is_superuser:
        return sel_dict
    employee_query = Employees.objects.filter(user= request.user)
    if len(employee_query) == 0:
        return Response({'Error':'No associated employee account for user'}, status = status.HTTP_403_FORBIDDEN)

    id = sel_dict['timesheet']['value'] #if key does not exist, except will catch the Error
    if not isinstance(id, list):
        id = [id]

    if len(id) == 0:
        return Response({'Error':'Attempt to bypass ID limitation in query'}, status = status.HTTP_403_FORBIDDEN)

    for i in id:
        if not TimeSheet.objects.filter(employee = employee_query[0].id, id=i).exists():
            return Response({'Error':'Attempt to access timesheet not existing for user/employee'}, status = status.HTTP_403_FORBIDDEN)
    return sel_dict

def limitLineItemDel(request, sel_dict:dict) -> dict:
    #When deleting line items, only information we have is the line item id's. We extract the timesheet and underlying employee object to compare to current user
    if request.user.is_superuser:
        return sel_dict
    employee_query = Employees.objects.filter(user = request.user)
    if len(employee_query) == 0:
        return Response({'Error':'No associated employee account for user'}, status = status.HTTP_403_FORBIDDEN)

    id = sel_dict['id__in'] #These are line item ids
    if not isinstance(id, list):
        id = [id]

    if len(id) == 0:
        return Response({'Error':'Attempt to bypass ID limitation in query'}, status = status.HTTP_403_FORBIDDEN)

    line_item_obj = None
    for i in id:
        line_item_obj = LineItems.objects.get(id = i) #Should always give an object. Otherwise would not use since this method throws exceptions if not get success
        if line_item_obj.timesheet.employee.id != employee_query[0].id:
            return Response({'Error':'Attempt to access timesheet not existing for user/employee'}, status = status.HTTP_403_FORBIDDEN)
    return sel_dict

