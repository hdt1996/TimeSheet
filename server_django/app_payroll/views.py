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
from .utils import *

# Django's builtin ORM statements to prevent need for string queries/SQL injection risk


class EmployeeAdminView(APIView): 
    """ !!!! This view should be used cautiously by only root admins. A mistake without a backup may cause unintended bulk updates or deletions !!! """
    permission_classes = (permissions.IsAdminUser,) # Controls user/group access to CRUD options

    @method_decorator(csrf_protect, name = "get")
    def get(self, request):
        # Summary: Method using fetch request headers to customize query options. Contains validation to control input and output query data.
        #NOTE I declare these fields in this functions scope instead of in class because these variables will vary by CRUD method depending on developer decision
        response_fields = "*" #{'id': True, 'name': True} # These contain fields that will be sent in server JSON response
        fixed_selectors = {} #{'operator':'greater','value':10} # Contrary to 'selectors' from request header. This is a query that cannot be modified as determined by admin or back-end engineers
        allowed_fields = "*" #{"'id': True, 'name': True"} # This controls fields that can be used within 'selectors' from request header; asterisks * means all fields
        try:
            select_obj = processSelectors(request = request, fixed_selectors= fixed_selectors, allowed_fields= allowed_fields)
            if isinstance(select_obj, Response):
                return select_obj

            sel_dict = buildQuery(selectors= select_obj, fixed_selectors=fixed_selectors)
            table_query = Employees.objects.filter(**sel_dict)
            if len(table_query) == 0:
                return Response({'Empty':'No Data'}, status = status.HTTP_200_OK)

            serialized_employees = EmployeeGETSerializer(instance = table_query, many = True) #many argument to specify that we are serializing multiple objects/entries from table
            return processGetResponse(serialized=serialized_employees,response_fields=response_fields)

        except Exception as e:
            #TODO send email to IT Software team of severe server error to fix asap
            return Response({"Error":"Server Error. Notifying admins"}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)

    @method_decorator(csrf_exempt,name="post")
    def post(self, request):
        # Summary: for posting only single entry to Employee Table aka first Clock-In
        
        req_body = request.data
        if not isinstance(req_body,dict):
            return Response({"Error":"Input data is not valid"}, status = status.HTTP_403_FORBIDDEN)

        serialized_employees = EmployeePOSTSerializer(data = req_body, many = False) #False to serialize single object only. req_body contains fields-value pairs to create entry (Different from get's implementation)
        if not serialized_employees.is_valid():
            print(serialized_employees.errors)
            #TODO send email to IT Software team for logging purposes of all requests
            return Response({'Error':'Input data is not valid'}, status = status.HTTP_403_FORBIDDEN)

        data = dict(serialized_employees.data)
        Employees.objects.create(**data)
        return Response(data, status = status.HTTP_200_OK)

    @method_decorator(csrf_exempt,name="put")
    def put(self, request):
        # Summary: Update one or MULTIPLE entries queried by selectors.
        fixed_selectors = {} #{'operator':'greater','value':10} # Contrary to 'selectors' from request header. This is a query that cannot be modified as determined by admin or back-end engineers
        allowed_fields = "*" #{"'id': True, 'name': True"} # This controls fields that can be used within 'selectors' from request header; asterisks * means all fields
        try:
            req_body = request.data
            if not isinstance(req_body,dict):
                return Response({"Error":"Input data is not valid"}, status = status.HTTP_403_FORBIDDEN)

            select_obj = processSelectors(request = request, fixed_selectors= fixed_selectors, allowed_fields= allowed_fields)
            if isinstance(select_obj, Response):
                return select_obj

            sel_dict = buildQuery(selectors= select_obj, fixed_selectors=fixed_selectors)
            table_query = Employees.objects.filter(**sel_dict)
            if len(table_query) == 0:
                return Response({'Empty':'No Data'}, status = status.HTTP_200_OK)

            serialized_employees = EmployeePUTSerializer(data = req_body, many = False)  #False to serialize single object only. req_body contains fields-value pairs to UPDATE entry (Different from get's implementation)
            if not serialized_employees.is_valid():
                print(serialized_employees.errors)
                return Response({'Error':'Input data is not valid'}, status = status.HTTP_403_FORBIDDEN)

            table_query.update(**serialized_employees.data) #Update all objects in table_query (list-like object)
            return Response(serialized_employees.data, status = status.HTTP_200_OK)

        except Exception as e:
            #TODO send email to IT Software team of severe server error to fix asap
            return Response({"Error":"Server Error. Notifying admins"}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)

    @method_decorator(csrf_exempt,name="delete")
    def delete(self, request):
        #Delete single or multiple entrys
        fixed_selectors = {} #{'operator':'greater','value':10} # Contrary to 'selectors' from request header. This is a query that cannot be modified as determined by admin or back-end engineers
        allowed_fields = {'id':True} #{"'id': True, 'name': True"} # This controls fields that can be used within 'selectors' from request header; asterisks * means all fields

        try:
            select_obj = processSelectors(request = request, fixed_selectors= fixed_selectors, allowed_fields= allowed_fields)
            if isinstance(select_obj, Response):
                return select_obj

            sel_dict = {'id__in':select_obj['id']}
            table_query = Employees.objects.filter(**sel_dict)
            if len(table_query) == 0:
                return Response({'Error':'Entry ID does not exist'}, status = status.HTTP_403_FORBIDDEN)
            if len(table_query) > 1:
                serialized_employees=EmployeeGETSerializer(instance = table_query, many=True)
            else:
                serialized_employees = EmployeeGETSerializer(instance = table_query[0], many=False)

            # using id is always safe to assume that only one or no entries exist since it is a primary key
            table_query.delete()
            return Response(serialized_employees.data, status = status.HTTP_200_OK)

        except Exception as e:
            #TODO send email to IT Software team of severe server error to fix asap
            return Response({"Error":"Server Error. Notifying admins"}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)

class LineItemsView(APIView):
    permission_classes = (permissions.AllowAny,) # Controls user/group access to CRUD options
    @method_decorator(csrf_protect, name = "get")
    def get(self, request):
        # Summary: Method using fetch request headers to customize query options. Contains validation to control input and output query data.
        #NOTE I declare these fields in this functions scope instead of in class because these variables will vary by CRUD method depending on developer decision
        response_fields = "*" #{'id': True, 'name': True} # These contain fields that will be sent in server JSON response
        fixed_selectors = {} #{'operator':'greater','value':10} # Contrary to 'selectors' from request header. This is a query that cannot be modified as determined by admin or back-end engineers
        allowed_fields = "*" #{"'id': True, 'name': True"} # This controls fields that can be used within 'selectors' from request header; asterisks * means all fields
        try:
            select_obj = processSelectors(request = request, fixed_selectors= fixed_selectors, allowed_fields= allowed_fields)
            if isinstance(select_obj, Response):
                return select_obj

            sel_dict = buildQuery(selectors= select_obj, fixed_selectors=fixed_selectors)
            sel_dict = limitLineItemAccess(request, sel_dict)
            if isinstance(sel_dict, Response):
                return sel_dict
            table_query = LineItems.objects.filter(**sel_dict)
            if len(table_query) == 0:
                return Response({'Empty':'No Data'}, status = status.HTTP_200_OK)

            serialized_line_items = LineItemsGETSerializer(instance = table_query, many = True) #many argument to specify that we are serializing multiple objects/entries from table
            return processGetResponse(serialized = serialized_line_items, response_fields=response_fields)

        except Exception as e:
            #TODO send email to IT Software team of severe server error to fix asap
            return Response({"Error":"Server Error. Notifying admins"}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request):
        #Delete single or multiple entrys
        fixed_selectors = {} #{'operator':'greater','value':10} # Contrary to 'selectors' from request header. This is a query that cannot be modified as determined by admin or back-end engineers
        allowed_fields = {'id':True} #{"'id': True, 'name': True"} # This controls fields that can be used within 'selectors' from request header; asterisks * means all fields
        try:
            select_obj = processSelectors(request = request, fixed_selectors= fixed_selectors, allowed_fields= allowed_fields)
            if isinstance(select_obj, Response):
                return select_obj

            sel_dict = {'id__in':select_obj['id']}
            sel_dict = limitLineItemDel(request, sel_dict)
            if isinstance(sel_dict, Response):
                return sel_dict
            table_query = LineItems.objects.filter(**sel_dict)
            
            if len(table_query) == 0:
                return Response({'Error':'Entry ID does not exist'}, status = status.HTTP_403_FORBIDDEN)
            if len(table_query) > 1:
                serialized_line_items=LineItemsGETSerializer(instance = table_query, many=True)
            else:
                serialized_line_items = LineItemsGETSerializer(instance = table_query[0], many=False)

            # using id is always safe to assume that only one or no entries exist since it is a primary key
            table_query.delete()
            return Response(serialized_line_items.data, status = status.HTTP_200_OK)

        except Exception as e:
            #TODO send email to IT Software team of severe server error to fix asap
            return Response({"Error":"Server Error. Notifying admins"}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)

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
        try:
            select_obj = processSelectors(request = request, fixed_selectors= fixed_selectors, allowed_fields= allowed_fields)
            if isinstance(select_obj, Response):
                return select_obj

            sel_dict = buildQuery(selectors= select_obj, fixed_selectors=fixed_selectors)
            sel_dict = limitTimesheetAccess(request, sel_dict)
            if isinstance(sel_dict, Response):
                return sel_dict
            table_query = TimeSheet.objects.filter(**sel_dict)

            if len(table_query) == 0:
                return Response({'Empty':'No Data'}, status = status.HTTP_200_OK)

            serialized_timesheets = TimeSheetGETSerializer(instance = table_query, many = True) #many argument to specify that we are serializing multiple objects/entries from table
            return processGetResponse(serialized = serialized_timesheets, response_fields=response_fields)

        except Exception as e:
            #TODO send email to IT Software team of severe server error to fix asap
            print(e)
            return Response({"Error":"Server Error. Notifying admins"}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)

    @method_decorator(csrf_exempt,name="post")
    def post(self, request):
        timesheet_data = request.data['TimeSheetData']
        line_item_data = request.data['LineItemsData']

        # Process Timesheet and Line Items data in request
        if not isinstance(timesheet_data,dict) or not isinstance(line_item_data,list):
            return Response({"Error":"Input data is not valid"}, status = status.HTTP_403_FORBIDDEN)

        serialized_timesheet = TimeSheetPOSTSerializer(data = timesheet_data, many = False)
        serialized_line_items = LineItemsPOSTSerializer(data = line_item_data, many = True)

        if not serialized_timesheet.is_valid() or not serialized_line_items.is_valid():
            #TODO send email to IT Software team for logging purposes of all requests
            print(serialized_timesheet.errors)
            print(serialized_line_items.errors)
            return Response({'Error':'Input data is not valid'}, status = status.HTTP_403_FORBIDDEN)
        
        #Process employee foreign key and use to create new timesheet object (employee required)
        timesheet_data = dict(serialized_timesheet.data) #Copy to mutate later
         #Serializer will not conver this foreign key property to numerical id, received as string
        sel_dict = {'id':serialized_timesheet.data['employee']}
        sel_dict = limitTimesheetAccess(request, sel_dict = sel_dict, field = 'id')
        if isinstance(sel_dict, Response):
            return sel_dict
        employee_query = Employees.objects.filter(**sel_dict) 
        if len(employee_query) == 0:
            return Response({'Error':'Entry ID does not exist'}, status = status.HTTP_403_FORBIDDEN)

        timesheet_data['employee'] = employee_query[0]
        new_timesheet = TimeSheet.objects.create(**timesheet_data)
            
        #Create line item objects using created timesheet above as foreign key
        line_item_objects=[]
        for line in line_item_data:
            line['timesheet'] = new_timesheet
            new_entry = LineItems.objects.create(**line)
            line_item_objects.append(new_entry)

        new_timesheet.total_time = new_timesheet.getTotalMinutes()
        new_timesheet.total_bill = new_timesheet.total_time * new_timesheet.bill_rate
        new_timesheet.save()
        serialized_line_items = LineItemsGETSerializer(instance = line_item_objects, many = True).data
        serialized_timesheet = TimeSheetGETSerializer(instance = new_timesheet).data #Ready to be sent as JSON
        return Response({"TimeSheet":serialized_timesheet,"LineItems":serialized_line_items}, status = status.HTTP_200_OK)

    @method_decorator(csrf_exempt,name="put")
    def put(self, request):
        timesheet_data = request.data['TimeSheetData']
        line_item_data = request.data['LineItemsData']

        if not isinstance(timesheet_data,dict) or not isinstance(line_item_data,list) or timesheet_data.get('id') == None:
            return Response({"Error":"Input data is not valid"}, status = status.HTTP_403_FORBIDDEN)

        timesheet_id = timesheet_data['id']
        serialized_timesheet = TimeSheetPUTSerializer(data = timesheet_data, many = False)
        serialized_line_items = LineItemsPUTSerializer(data = line_item_data, many = True)

        if not serialized_timesheet.is_valid() or not serialized_line_items.is_valid():
            #TODO send email to IT Software team for logging purposes of all requests
            print(serialized_timesheet.errors)
            print(serialized_line_items.errors)
            return Response({'Error':'Input data is not valid'}, status = status.HTTP_403_FORBIDDEN)

        timesheet_data = dict(serialized_timesheet.data)
        sel_dict = {'id':timesheet_id}
        sel_dict = limitTimesheetAccess(request, sel_dict = sel_dict, field = 'id')
        if isinstance(sel_dict, Response):
            return sel_dict
        timesheet_query = TimeSheet.objects.filter(id = timesheet_id)
        if len(timesheet_query) == 0:
            return Response({'Error':'Entry ID does not exist'}, status = status.HTTP_403_FORBIDDEN)
        # using id is always safe to assume that only one or no entries exist since it is a primary key

        timesheet_query.update(**timesheet_data)
        timesheet_entry = timesheet_query[0]
        current_existing_ids=[]

        for line in line_item_data:
            line_item_id = line.pop("id")
            line['timesheet'] = timesheet_entry
            line_obj, created= LineItems.objects.update_or_create(id=line_item_id, defaults = line)
            current_existing_ids.append(line_obj.id)

        # Delete line_objects that do not exist in updated form
        deleted_lines_query = LineItems.objects.filter(timesheet = timesheet_id).exclude(id__in=current_existing_ids)
        if len(deleted_lines_query) > 0:
            deleted_lines_query.delete()
        line_items_query = LineItems.objects.filter(timesheet = timesheet_id) #Get current list of line items after deleting

        timesheet_entry.total_time = timesheet_entry.getTotalMinutes()
        timesheet_entry.total_bill = timesheet_entry.total_time * timesheet_entry.bill_rate
        timesheet_entry.save()
        timesheet_data = TimeSheetGETSerializer(instance = timesheet_entry, many=False).data
        line_item_data = LineItemsGETSerializer(instance = line_items_query, many = True).data
        deleted_lines_response = LineItemsGETSerializer(instance = deleted_lines_query, many = True).data
        return Response({"TimeSheet":timesheet_data, "LineItems":line_item_data, "DeletedLineItems":deleted_lines_response}, status = status.HTTP_200_OK)
        
    @method_decorator(csrf_exempt,name="delete")
    def delete(self, request):
        #Delete single or multiple entrys
        fixed_selectors = {} #{'operator':'greater','value':10} # Contrary to 'selectors' from request header. This is a query that cannot be modified as determined by admin or back-end engineers
        allowed_fields = {'id':True} #{"'id': True, 'name': True"} # This controls fields that can be used within 'selectors' from request header; asterisks * means all fields
        try:
            select_obj = processSelectors(request = request, fixed_selectors= fixed_selectors, allowed_fields= allowed_fields)
            if isinstance(select_obj, Response):
                return select_obj

            sel_dict = {'id__in':select_obj['id']}
            sel_dict = limitTimesheetDelete(request, sel_dict)
            if isinstance(sel_dict, Response):
                return sel_dict
            table_query = TimeSheet.objects.filter(**sel_dict)

            if len(table_query) == 0:
                return Response({'Error':'Entry ID does not exist'}, status = status.HTTP_403_FORBIDDEN)
            if len(table_query) > 1:
                serialized_data=list(TimeSheetGETSerializer(instance = table_query, many=True).data)
            else:
                serialized_data = list([TimeSheetGETSerializer(instance = table_query[0], many=False).data])
            # using id is always safe to assume that only one or no entries exist since it is a primary key
            table_query.delete()
            return Response(serialized_data, status = status.HTTP_200_OK)

        except Exception as e:
            #TODO send email to IT Software team of severe server error to fix asap
            return Response({"Error":"Server Error. Notifying admins"}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)