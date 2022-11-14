from rest_framework import status
from rest_framework.response import Response
from .serializer import *
import json, os

if os.environ.get('DEBUG'):
    from .permissions.debug import getEmployeeByUser
else:
    from .permissions.production import getEmployeeByUser

NONSTRING_SANITATION = \
{
    models.BigAutoField: None,
    models.DecimalField:None,
    models.IntegerField:None,
    models.BooleanField:None,
    models.DateTimeField: None,
    models.ForeignKey: None
}

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

def processSelectors(request, fixed_selectors: dict, allowed_fields: dict, model: models.Model):
    if request.headers.get('selectors') == None:
        return Response({'Error':'No Search Parameters passed in'}, status = status.HTTP_403_FORBIDDEN)
    try:
        selectors =  json.loads(request.headers.get('selectors')) #Fetch options should contain 'selectors' key with value being dictionary --> example {'operator':'greater','value':10}
    except:
        # request header's 'selectors' should be JSON parsable to dictionary.
        return Response({}, status = status.HTTP_403_FORBIDDEN) 

    if len(selectors) == 0:
        return Response({}, status = status.HTTP_403_FORBIDDEN) # return empty JSON object if selectors is empty. To prevent too large of a query if there is only fixed_selectors which may be broad in scope
    sanitation_map = {}
    for field in model._meta.get_fields():
        sanitation_map[field.name] = type(field)
    for field in selectors:
        if field in fixed_selectors: # if any field in selectors matches those in fixed_selectors, this is not allowed. Only fields not matching keys in fixed_selectors pass this
            return Response({'Error':'Custom field passed into non-custom field'}, status = status.HTTP_403_FORBIDDEN)
        if field not in allowed_fields and allowed_fields != "*":
            return Response({'Error':'Disallowed field passed in'}, status = status.HTTP_403_FORBIDDEN)
        value = selectors[field]['value']
        field_type = sanitation_map[field]
        if field_type in NONSTRING_SANITATION and value == '':
            selectors[field]['value'] = NONSTRING_SANITATION[field_type]

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

def verifyTimesheetQuery(request, id_list: list, many: bool = False):
    employee = getEmployeeByUser(request)
    if isinstance(employee, Response): #If user is authenticated and there is no corresponding employee object
        return employee
    if employee == None:
        return
    if not many:
        if not TimeSheet.objects.filter(employee = employee.id, id=id_list).exists():
            return Response({'Error':'Attempt to access timesheet not existing for user/employee'}, status = status.HTTP_403_FORBIDDEN)
        return

    if len(id_list) == 0:
        return Response({'Error':'Attempt to bypass ID limitation in query'}, status = status.HTTP_403_FORBIDDEN)

    for i in id_list:
        if not TimeSheet.objects.filter(employee = employee.id, id=i).exists():
            return Response({'Error':'Attempt to access timesheet not existing for user/employee'}, status = status.HTTP_403_FORBIDDEN)

def verifyLineItemQuery(request, id_list: list, many: bool = False):
    #When deleting line items, only information we have is the line item id's. We extract the timesheet and underlying employee object to compare to current user
    employee = getEmployeeByUser(request)
    if isinstance(employee, Response): #If user is authenticated and there is no corresponding employee object
        return employee
    if employee == None:
        return
    if not many:
        line_item_query = LineItems.objects.filter(id = id_list)
        if len(line_item_query) == 0:
            return Response({'Error':'Nonexistent Line Item ID'}, status = status.HTTP_403_FORBIDDEN)
        if line_item_query[0].timesheet.employee.id != employee.id:
            return Response({'Error':'Attempt to access timesheet not existing for user/employee'}, status = status.HTTP_403_FORBIDDEN)
        return

    if len(id_list) == 0:
        return Response({'Error':'Attempt to bypass ID limitation in query'}, status = status.HTTP_403_FORBIDDEN)

    for i in id_list:
        line_item_query = LineItems.objects.filter(id = i) #Should always give an object. Otherwise would not use since this method throws exceptions if not get success
        if len(line_item_query) == 0:
            return Response({'Error':'Nonexistent Line Item ID'}, status = status.HTTP_403_FORBIDDEN)
        if line_item_query[0].timesheet.employee.id != employee.id:
            return Response({'Error':'Attempt to access timesheet not existing for user/employee'}, status = status.HTTP_403_FORBIDDEN)

