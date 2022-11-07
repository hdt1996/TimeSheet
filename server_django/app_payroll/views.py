from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status, permissions
# from rest_framework.authtoken.models import Token (Not using JWT Token this time for the exercise since it may take me more time than necessary to finish; Using DB Sessions instead)
import django.contrib.auth as auth
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect, csrf_exempt
from .models import *
from .serializer import *
import json
import datetime

# Django's builtin ORM statements to prevent need for string queries/SQL injection risk
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

class EmployeeAdminView(APIView): 
    """ !!!! This view should be used cautiously by only root admins. A mistake without a backup may cause unintended bulk updates or deletions !!! """
    permission_classes = (permissions.AllowAny,) # Controls user/group access to CRUD options

    @method_decorator(csrf_protect, name = "get")
    def get(self, request):
        # Summary: Method using fetch request headers to customize query options. Contains validation to control input and output query data.

        #NOTE I declare these fields in this functions scope instead of in class because these variables will vary by CRUD method depending on developer decision
        response_fields = "*" #{'id': True, 'name': True} # These contain fields that will be sent in server JSON response
        fixed_selectors = {} #{'operator':'greater','value':10} # Contrary to 'selectors' from request header. This is a query that cannot be modified as determined by admin or back-end engineers
        allowed_fields = "*" #{"'id': True, 'name': True"} # This controls fields that can be used within 'selectors' from request header; asterisks * means all fields

        if request.headers.get('selectors') == None:
            return Response({'Error':'No Search Parameters passed in'}, status = status.HTTP_403_FORBIDDEN)

        try:
            selectors =  json.loads(request.headers.get('selectors')) #Fetch options should contain 'selectors' key with value being dictionary --> example {'operator':'greater','value':10}
        except:
            # request header's 'selectors' should be JSON parsable to dictionary.
            return Response({}, status = status.HTTP_403_FORBIDDEN) 

        try:
            """Wrap remaining block in try-except in case there are unconsidered errors that may break webserver in production"""

            if len(selectors) == 0:
                return Response({}, status = status.HTTP_403_FORBIDDEN) # return empty JSON object if selectors is empty. To prevent too large of a query if there is only fixed_selectors which may be broad in scope

            for field in selectors:
                if field in fixed_selectors: # if any field in selectors matches those in fixed_selectors, this is not allowed. Only fields not matching keys in fixed_selectors pass this
                    return Response({'Error':'Custom field passed into non-custom field'}, status = status.HTTP_403_FORBIDDEN)
                if field not in allowed_fields and allowed_fields != "*":
                    return Response({'Error':'Disallowed field passed in'}, status = status.HTTP_403_FORBIDDEN)

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
            
            table_query = Employees.objects.filter(**sel_dict)

            if len(table_query) == 0:
                return Response({'Empty':'No Data'}, status = status.HTTP_200_OK)

            serialized_query = EmployeeGETSerializer(instance = table_query, many = True) #many argument to specify that we are serializing multiple objects/entries from table
            
            if response_fields == "*":
                return Response(serialized_query.data, status = status.HTTP_200_OK)

            response_data = []
            for entry in serialized_query.data:
                obj_dict = {}
                for key in response_fields: # We use self.response_fields to filter through data to only select only the entry properties that we want shown
                    obj_dict[key] = entry[key]
                response_data.append(obj_dict)
            return Response(response_data, status = status.HTTP_200_OK)

        except Exception as e:
            #TODO send email to IT Software team of severe server error to fix asap
            return Response({"Error":"Server Error. Notifying admins"}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)

    @method_decorator(csrf_exempt,name="post")
    def post(self, request):
        # Summary: for posting only single entry to Employee Table aka first Clock-In
        
        req_body = request.data
        if not isinstance(req_body,dict):
            return Response({"Error":"Request body not valid"}, status = status.HTTP_403_FORBIDDEN)
        serialized_data = EmployeePOSTSerializer(data = req_body, many = False) #False to serialize single object only. req_body contains fields-value pairs to create entry (Different from get's implementation)
        if not serialized_data.is_valid():
            print(serialized_data.errors)
            #TODO send email to IT Software team for logging purposes of all requests
            return Response({'Error':'Data invalid by serializer'}, status = status.HTTP_403_FORBIDDEN)
        data = dict(serialized_data.data)
        Employees.objects.create(**data)
        return Response(data, status = status.HTTP_200_OK)

    @method_decorator(csrf_exempt,name="put")
    def put(self, request):
        # Summary: Update one or MULTIPLE entries queried by selectors.

        fixed_selectors = {} # {'field_1': {'operator': 'equal', 'value': True}}
        allowed_fields = "*" #{'field_1': True, 'field_10': True}

        req_body = request.data
        if not isinstance(req_body,dict):
            return Response({"Error":"Request body not valid"}, status = status.HTTP_403_FORBIDDEN)

        if request.headers.get('selectors') == None:
            return Response({'Error':'No Search Parameters passed in'}, status = status.HTTP_403_FORBIDDEN)

        try:
            selectors =  json.loads(request.headers.get('selectors')) #Fetch options should contain 'selectors' key with value being dictionary --> example {'operator':'greater','value':10}
        except:
            # request header's 'selectors' should be JSON parsable to dictionary.
            return Response({}, status = status.HTTP_403_FORBIDDEN) 
        try:
            """Wrap remaining block in try-except in case there are unconsidered errors that may break webserver in production"""
            
            if len(selectors) == 0:
                return Response({}, status = status.HTTP_403_FORBIDDEN) # return empty JSON object if selectors is empty. To prevent too large of a query if there is only fixed_selectors which may be broad in scope
            
            for field in selectors:
                if field in fixed_selectors:
                    return Response({'Error':'Custom field passed into non-custom field'}, status = status.HTTP_403_FORBIDDEN)
                if field not in allowed_fields and allowed_fields != "*":
                    return Response({'Error':'Disallowed field passed in'}, status = status.HTTP_403_FORBIDDEN)
            sel_dict = {}

            for field in fixed_selectors:
                oper = fixed_selectors[field]['operator']
                value = fixed_selectors[field]['value']
                sel_dict[f"{field}{QUERY_OPTIONS[oper]}"] = value
            
            for field in selectors:
                oper = selectors[field]['operator']
                value = selectors[field]['value']
                if oper in QUERY_OPTIONS:
                    sel_dict[f"{field}{QUERY_OPTIONS[oper]}"] = value


            table_query = Employees.objects.filter(**sel_dict)

            if len(table_query) == 0:
                return Response({'Empty':'No Data'}, status = status.HTTP_200_OK)

            serialized_data = EmployeePUTSerializer(data = req_body, many = False)  #False to serialize single object only. req_body contains fields-value pairs to UPDATE entry (Different from get's implementation)

            if not serialized_data.is_valid():
                print(serialized_data.errors)
                return Response({'Error':'Data invalid by serializer'}, status = status.HTTP_403_FORBIDDEN)

            data = dict(serialized_data.data)
            table_query.update(**data) #Update all objects in table_query (list-like object)
            return Response(data, status = status.HTTP_200_OK)
        except Exception as e:
            #TODO send email to IT Software team of severe server error to fix asap
            return Response({"Error":"Server Error. Notifying admins"}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)

    @method_decorator(csrf_exempt,name="delete")
    def delete(self, request):
        #Delete single or multiple entrys
        if request.headers.get('selectors') == None:
            return Response({'Error':'No Search Parameters passed in to find entry for deletion'}, status = status.HTTP_403_FORBIDDEN)
        try:
            selectors =  json.loads(request.headers.get('selectors')) #Fetch options should contain 'selectors' key with value being dictionary --> example {'operator':'greater','value':10}
        except:
            # request header's 'selectors' should be JSON parsable to dictionary.
            return Response({}, status = status.HTTP_403_FORBIDDEN) 
    
        #False to serialize single object only. req_body contains fields-value pairs to create entry (Different from get's implementation)
        if not "id" in selectors:
            return Response({'Error':'Please pass in ID for deletion'}, status = status.HTTP_403_FORBIDDEN)
        id = selectors.pop("id")
        if not isinstance(id, list):
            table_query = Employees.objects.filter(id = id)
        else:
            table_query = Employees.objects.filter(id__in=id)

        if len(table_query) == 0:
            return Response({'Error':'Entry ID does not exist'}, status = status.HTTP_403_FORBIDDEN)
        if len(table_query) > 1:
            serialized_data=EmployeeGETSerializer(instance = table_query, many=True)
        else:
            serialized_data = EmployeeGETSerializer(instance = table_query[0], many=False)
        # using id is always safe to assume that only one or no entries exist since it is a primary key
        table_query.delete()
        return Response(serialized_data.data, status = status.HTTP_200_OK)

class LineItemsView(APIView):
    permission_classes = (permissions.AllowAny,) # Controls user/group access to CRUD options
    @method_decorator(csrf_protect, name = "get")
    def get(self, request):
        # Summary: Method using fetch request headers to customize query options. Contains validation to control input and output query data.

        #NOTE I declare these fields in this functions scope instead of in class because these variables will vary by CRUD method depending on developer decision
        response_fields = "*" #{'id': True, 'name': True} # These contain fields that will be sent in server JSON response
        fixed_selectors = {} #{'operator':'greater','value':10} # Contrary to 'selectors' from request header. This is a query that cannot be modified as determined by admin or back-end engineers
        allowed_fields = "*" #{"'id': True, 'name': True"} # This controls fields that can be used within 'selectors' from request header; asterisks * means all fields

        if request.headers.get('selectors') == None:
            return Response({'Error':'No Search Parameters passed in'}, status = status.HTTP_403_FORBIDDEN)

        try:
            selectors =  json.loads(request.headers.get('selectors')) #Fetch options should contain 'selectors' key with value being dictionary --> example {'operator':'greater','value':10}
        except:
            # request header's 'selectors' should be JSON parsable to dictionary.
            return Response({}, status = status.HTTP_403_FORBIDDEN) 

        try:
            """Wrap remaining block in try-except in case there are unconsidered errors that may break webserver in production"""

            if len(selectors) == 0:
                return Response({}, status = status.HTTP_403_FORBIDDEN) # return empty JSON object if selectors is empty. To prevent too large of a query if there is only fixed_selectors which may be broad in scope

            for field in selectors:
                if field in fixed_selectors: # if any field in selectors matches those in fixed_selectors, this is not allowed. Only fields not matching keys in fixed_selectors pass this
                    return Response({'Error':'Custom field passed into non-custom field'}, status = status.HTTP_403_FORBIDDEN)
                if field not in allowed_fields and allowed_fields != "*":
                    return Response({'Error':'Disallowed field passed in'}, status = status.HTTP_403_FORBIDDEN)

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
            
            table_query = LineItems.objects.filter(**sel_dict)

            if len(table_query) == 0:
                return Response({'Empty':'No Data'}, status = status.HTTP_200_OK)

            serialized_query = LineItemsGETSerializer(instance = table_query, many = True) #many argument to specify that we are serializing multiple objects/entries from table
            
            if response_fields == "*":
                return Response(serialized_query.data, status = status.HTTP_200_OK)

            response_data = []
            for entry in serialized_query.data:
                obj_dict = {}
                for key in response_fields: # We use self.response_fields to filter through data to only select only the entry properties that we want shown
                    obj_dict[key] = entry[key]
                response_data.append(obj_dict)
            return Response(response_data, status = status.HTTP_200_OK)

        except Exception as e:
            #TODO send email to IT Software team of severe server error to fix asap
            return Response({"Error":"Server Error. Notifying admins"}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)
    def delete(self, request):
        #Delete single or multiple entrys
        if request.headers.get('selectors') == None:
            return Response({'Error':'No Search Parameters passed in to find entry for deletion'}, status = status.HTTP_403_FORBIDDEN)
        try:
            selectors =  json.loads(request.headers.get('selectors')) #Fetch options should contain 'selectors' key with value being dictionary --> example {'operator':'greater','value':10}
        except:
            # request header's 'selectors' should be JSON parsable to dictionary.
            return Response({}, status = status.HTTP_403_FORBIDDEN) 
    
        #False to serialize single object only. req_body contains fields-value pairs to create entry (Different from get's implementation)
        if not "id" in selectors:
            return Response({'Error':'Please pass in ID for deletion'}, status = status.HTTP_403_FORBIDDEN)
        id = selectors.pop("id")
        if not isinstance(id, list):
            table_query = LineItems.objects.filter(id = id)
        else:
            table_query = LineItems.objects.filter(id__in=id)
        
        if len(table_query) == 0:
            return Response({'Error':'Entry ID does not exist'}, status = status.HTTP_403_FORBIDDEN)
        if len(table_query) > 1:
            serialized_data=LineItemsGETSerializer(instance = table_query, many=True)
        else:
            serialized_data = LineItemsGETSerializer(instance = table_query[0], many=False)
        # using id is always safe to assume that only one or no entries exist since it is a primary key
        table_query.delete()
        return Response(serialized_data.data, status = status.HTTP_200_OK)

class TimeSheetView(APIView):
    """ Aside from the get request, all other crud options can only perform on one entry at at a time """
    """ !!!! This view should be used cautiously by only root admins. A mistake without a backup may cause unintended bulk updates or deletions !!! """
    permission_classes = (permissions.AllowAny,) # Controls user/group access to CRUD options
    @method_decorator(csrf_protect, name = "get")
    def get(self, request):
        # Summary: Method using fetch request headers to customize query options. Contains validation to control input and output query data.

        #NOTE I declare these fields in this functions scope instead of in class because these variables will vary by CRUD method depending on developer decision
        response_fields = "*" #{'id': True, 'name': True} # These contain fields that will be sent in server JSON response
        fixed_selectors = {} #{'operator':'greater','value':10} # Contrary to 'selectors' from request header. This is a query that cannot be modified as determined by admin or back-end engineers
        allowed_fields = "*" #{"'id': True, 'name': True"} # This controls fields that can be used within 'selectors' from request header; asterisks * means all fields

        if request.headers.get('selectors') == None:
            return Response({'Error':'No Search Parameters passed in'}, status = status.HTTP_403_FORBIDDEN)

        try:
            selectors =  json.loads(request.headers.get('selectors')) #Fetch options should contain 'selectors' key with value being dictionary --> example {'operator':'greater','value':10}
        except:
            # request header's 'selectors' should be JSON parsable to dictionary.
            return Response({}, status = status.HTTP_403_FORBIDDEN) 

        try:
            """Wrap remaining block in try-except in case there are unconsidered errors that may break webserver in production"""

            if len(selectors) == 0:
                return Response({}, status = status.HTTP_403_FORBIDDEN) # return empty JSON object if selectors is empty. To prevent too large of a query if there is only fixed_selectors which may be broad in scope

            for field in selectors:
                if field in fixed_selectors: # if any field in selectors matches those in fixed_selectors, this is not allowed. Only fields not matching keys in fixed_selectors pass this
                    return Response({'Error':'Custom field passed into non-custom field'}, status = status.HTTP_403_FORBIDDEN)
                if field not in allowed_fields and allowed_fields != "*":
                    return Response({'Error':'Disallowed field passed in'}, status = status.HTTP_403_FORBIDDEN)

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
            
            table_query = TimeSheet.objects.filter(**sel_dict)

            if len(table_query) == 0:
                return Response({'Empty':'No Data'}, status = status.HTTP_200_OK)

            serialized_query = TimeSheetGETSerializer(instance = table_query, many = True) #many argument to specify that we are serializing multiple objects/entries from table
            
            if response_fields == "*":
                return Response(serialized_query.data, status = status.HTTP_200_OK)

            response_data = []
            for entry in serialized_query.data:
                obj_dict = {}
                for key in response_fields: # We use self.response_fields to filter through data to only select only the entry properties that we want shown
                    obj_dict[key] = entry[key]
                response_data.append(obj_dict)
            return Response(response_data, status = status.HTTP_200_OK)

        except Exception as e:
            #TODO send email to IT Software team of severe server error to fix asap
            return Response({"Error":"Server Error. Notifying admins"}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)
    @method_decorator(csrf_exempt,name="post")
    def post(self, request):
        timesheet_data = request.data['TimeSheetData']
        line_item_data = request.data['LineItemsData']
        # Set up Billings TimeSheet

        if not isinstance(timesheet_data,dict):
            return Response({"Error":"Request body not valid"}, status = status.HTTP_403_FORBIDDEN)
        serialized_timesheet = TimeSheetPOSTSerializer(data = timesheet_data, many = False) #False to serialize single object only. TimeSheet_data contains fields-value pairs to create entry (Different from get's implementation)
        if not serialized_timesheet.is_valid():
            #TODO send email to IT Software team for logging purposes of all requests
            print(serialized_timesheet.errors)
            return Response({'Error':'Data invalid by serializer'}, status = status.HTTP_403_FORBIDDEN)
        data = dict(serialized_timesheet.data)
        emp_id = timesheet_data.get('employee')
        if emp_id == None:
            return Response({'Error':'Employee ID is required to proceed with this endpoint'}, status = status.HTTP_403_FORBIDDEN)  
        if not emp_id.isdigit():
            return Response({'Error':'Employee ID must be a number'}, status = status.HTTP_403_FORBIDDEN)  
        employee_query = Employees.objects.filter(id=int(emp_id))      
        if len(employee_query) > 0:
            employee = employee_query[0]
            data['employee'] = employee
            new_timesheet = TimeSheet.objects.create(**data)
        else:
            new_timesheet = TimeSheet.objects.create(**data)

        serialized_timesheet = dict(TimeSheetGETSerializer(instance = new_timesheet).data) #Ready to be sent as JSON

        # Set up Billings Lines
        # Use new_TimeSheet variable for TimeSheet timesheet ID to foreign key
        if not isinstance(line_item_data,list):
            return Response({"Error":"Request body not valid"}, status = status.HTTP_403_FORBIDDEN)
        line_item_objects=[]
        for item in line_item_data:
            serialized_item = LineItemsPOSTSerializer(data = item, many = False) #False to serialize single object only. TimeSheet_data contains fields-value pairs to create entry (Different from get's implementation)
            if not serialized_item.is_valid():
                #TODO send email to IT Software team for logging purposes of all requests
                print(serialized_item.errors)
                return Response({'Error':'Data invalid by serializer'}, status = status.HTTP_403_FORBIDDEN)
            line_item_dict = dict(serialized_item.data)
            line_item_dict['timesheet'] = new_timesheet
            new_entry = LineItems.objects.create(**line_item_dict)
            line_item_objects.append(new_entry)
        serialized_line_items = LineItemsGETSerializer(instance = line_item_objects, many = True).data
        return Response({"TimeSheet":serialized_timesheet,"LineItems":serialized_line_items}, status = status.HTTP_200_OK)

    @method_decorator(csrf_exempt,name="put")
    def put(self, request):
        timesheet_data = request.data['TimeSheetData']
        line_item_data = request.data['LineItemsData']

        timesheet_id = timesheet_data.get('id')
        if timesheet_id == None:
            return Response({"Error":"Request body not valid"}, status = status.HTTP_403_FORBIDDEN)

        if not isinstance(timesheet_data,dict):
            return Response({"Error":"Request body not valid"}, status = status.HTTP_403_FORBIDDEN)
        serialized_timesheet = TimeSheetPUTSerializer(data = timesheet_data, many = False) #False to serialize single object only. req_body contains fields-value pairs to create entry (Different from get's implementation)
        if not serialized_timesheet.is_valid():
            #TODO send email to IT Software team for logging purposes of all requests
            print(serialized_timesheet.errors)
            return Response({'Error':'Data invalid by serializer'}, status = status.HTTP_403_FORBIDDEN)
        data = dict(serialized_timesheet.data)
        timesheet_query = TimeSheet.objects.filter(id = timesheet_id)
        if len(timesheet_query) == 0:
            return Response({'Error':'Entry ID does not exist'}, status = status.HTTP_403_FORBIDDEN)
        # using id is always safe to assume that only one or no entries exist since it is a primary key
        timesheet_query.update(**data)
        timesheet_entry = timesheet_query[0]
        timesheet_response = TimeSheetGETSerializer(instance = timesheet_entry, many=False)
        if not isinstance(line_item_data,list):
            return Response({"Error":"Request body not valid"}, status = status.HTTP_403_FORBIDDEN)
        line_objects=[]
        existing_ids=[]
        for item in line_item_data:
            line_item_id = item.pop("id")
            
            serialized_item = LineItemsPUTSerializer(data = item, many = False) #False to serialize single object only. TimeSheet_data contains fields-value pairs to create entry (Different from get's implementation)

            if not serialized_item.is_valid():
                #TODO send email to IT Software team for logging purposes of all requests
                print(serialized_item.errors)
                return Response({'Error':'Data invalid by serializer'}, status = status.HTTP_403_FORBIDDEN)
            item_data = dict(serialized_item.data)
            item_data['timesheet'] = timesheet_entry
            line_query= LineItems.objects.filter(id=line_item_id)
            if len(line_query) == 0:
                line_obj = LineItems.objects.create(**item_data)
            else:
                line_query.update(**item_data) 
                line_obj = line_query[0]
            existing_ids.append(line_obj.id)
            line_objects.append(line_obj) 

        # Delete line_objects that do not exist in updated form
        deleted_lines_query = LineItems.objects.filter(timesheet = timesheet_id).exclude(id__in=existing_ids)
        deleted_lines_response = LineItemsGETSerializer(instance = deleted_lines_query, many = True)
        deleted_lines_response = list(deleted_lines_response.data)
        
        if len(deleted_lines_query) > 0:
            deleted_lines_query.delete()
        line_items_response = LineItemsGETSerializer(instance = line_objects, many = True)
        print(line_items_response.data)
        return Response({"TimeSheet":timesheet_response.data, "LineItems":line_items_response.data, "DeletedLineItems":deleted_lines_response}, status = status.HTTP_200_OK)
        
    @method_decorator(csrf_exempt,name="delete")
    def delete(self, request):
        #Delete single or multiple entrys
        if request.headers.get('selectors') == None:
            return Response({'Error':'No Search Parameters passed in to find entry for deletion'}, status = status.HTTP_403_FORBIDDEN)
        try:
            selectors =  json.loads(request.headers.get('selectors')) #Fetch options should contain 'selectors' key with value being dictionary --> example {'operator':'greater','value':10}
        except:
            # request header's 'selectors' should be JSON parsable to dictionary.
            return Response({}, status = status.HTTP_403_FORBIDDEN) 
    
        #False to serialize single object only. req_body contains fields-value pairs to create entry (Different from get's implementation)
        if not "id" in selectors:
            return Response({'Error':'Please pass in ID for deletion'}, status = status.HTTP_403_FORBIDDEN)
        id = selectors.pop("id")

        if not isinstance(id, list):
            table_query = TimeSheet.objects.filter(id = id)
        else:
            table_query = TimeSheet.objects.filter(id__in=id)

        if len(table_query) == 0:
            return Response({'Error':'Entry ID does not exist'}, status = status.HTTP_403_FORBIDDEN)
        if len(table_query) > 1:
            serialized_data=list(TimeSheetGETSerializer(instance = table_query, many=True).data)
        else:
            serialized_data = list([TimeSheetGETSerializer(instance = table_query[0], many=False).data])
        # using id is always safe to assume that only one or no entries exist since it is a primary key
        table_query.delete()
        return Response(serialized_data, status = status.HTTP_200_OK)
