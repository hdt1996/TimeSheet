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
            return Response({'Selector_Error':'No Search Parameters passed in'}, status = status.HTTP_403_FORBIDDEN)

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
                    return Response({'Selector_Error':'Disallowed field passed in'}, status = status.HTTP_403_FORBIDDEN)

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
            return Response({"Error: Server Error. Notifying admins"}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)

    @method_decorator(csrf_exempt,name="post")
    def post(self, request):
        # Summary: for posting only single entry to Employee Table aka first Clock-In
        
        req_body = request.data
        if not isinstance(req_body,dict):
            return Response({"Error":"Data not compatible to database entries"}, status = status.HTTP_403_FORBIDDEN)
        serialized_data = EmployeePOSTSerializer(data = req_body, many = False) #False to serialize single object only. req_body contains fields-value pairs to create entry (Different from get's implementation)
        if not serialized_data.is_valid():
            #TODO send email to IT Software team for logging purposes of all requests
            return Response({'Error':'Input data is not valid'}, status = status.HTTP_403_FORBIDDEN)
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
            return Response({"Error":"Data not compatible to database entries"}, status = status.HTTP_403_FORBIDDEN)

        if request.headers.get('selectors') == None:
            return Response({'Selector_Error':'No Search Parameters passed in'}, status = status.HTTP_403_FORBIDDEN)

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
                    return Response({'Selector_Error':'Custom field passed into non-custom field'}, status = status.HTTP_403_FORBIDDEN)
                if field not in allowed_fields and allowed_fields != "*":
                    return Response({'Selector_Error':'Disallowed field passed in'}, status = status.HTTP_403_FORBIDDEN)
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
                return Response({'Error':'Input data is not valid'}, status = status.HTTP_403_FORBIDDEN)

            data = dict(serialized_data.data)
            table_query.update(**data) #Update all objects in table_query (list-like object)
            return Response(data, status = status.HTTP_200_OK)
        except Exception as e:
            #TODO send email to IT Software team of severe server error to fix asap
            return Response({"Error: Server Error. Notifying admins"}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)

    @method_decorator(csrf_exempt,name="delete")
    def delete(self, request):
        # Summary: Delete one or MULTIPLE entries queried by selectors
        fixed_selectors = {} #{'field_1': {'operator': 'equal', 'value': True}}
        allowed_fields = "*" #{'field_1': True, 'field_10': True}

        if request.headers.get('selectors') == None:
            return Response({'Selector_Error':'No Search Parameters passed in'}, status = status.HTTP_403_FORBIDDEN)

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
                    return Response({'Selector_Error':'Disallowed field passed in'}, status = status.HTTP_403_FORBIDDEN)
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
        
            table_query.delete() #Delete all objects in table_query (list-like object)
            return Response({'DELETE':'Success'}, status = status.HTTP_200_OK)

        except Exception as e:
            #TODO send email to IT Software team of severe server error to fix asap
            return Response({"Error: Server Error. Notifying admins"}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)
