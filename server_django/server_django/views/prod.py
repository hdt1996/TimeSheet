from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect, csrf_exempt
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from ..serializer import *
import django.contrib.auth as auth
from app_payroll.models import *
from app_payroll.serializer import *
from django.conf import settings
from utils.py.development import Development
import traceback
DEV = Development(proj_dir = 'Timesheet',test_dir = 'Timesheet/tests',log_dir = 'Timesheet/logs')


@method_decorator(ensure_csrf_cookie,name='get')
class GetCSRFToken(APIView):
    permission_classes = (permissions.AllowAny,)
    def get(self, request):
        return Response({'Success': 'CSRF Cookie Set'})

class CreateLoginView(APIView):
    permission_classes = (permissions.AllowAny,)
    def post(self,request): #Endpoint for creating users and employee accounts. Assume that this web service is only accessible to internal users
        user_data = request.data['user']
        employee_data=request.data['employee']

        """ DATA VALIDATION START """

        data_valid = True
        if not isinstance(user_data,dict) or not isinstance(employee_data,dict):
            data_valid = False
        if user_data.get('username') == None or user_data.get('password') == None:
            data_valid = False
        serialized_user = UserSerializer(data=user_data, many = False)
        if serialized_user.is_valid() == False:
            data_valid = False
        if not data_valid:
            return Response({'Error':'Invalid Data'},status=status.HTTP_403_FORBIDDEN)

        """ DATA VALIDATION END """
        
        employee_data['name'] = f"{user_data['first_name']} {user_data['last_name']}"
        username = user_data.pop('username')
        password = user_data.pop('password')
        user_query = User.objects.filter(username=username)

        if len(user_query) == 0: #Means user does not exist, so okay to create new account
            data_valid = True
            try:
                auth.password_validation.validate_password(password)
            except Exception as e:
                return Response({'Error':e}, status = status.HTTP_403_FORBIDDEN)

            serialized_employee = EmployeePOSTSerializer(data=employee_data, many = False)
            if serialized_employee.is_valid() == False:
                return Response({'Error':'Invalid Data'},status=status.HTTP_403_FORBIDDEN)

            new_user = User.objects.create(username=username)
            new_user.set_password(password)
            new_user.save()
            employee_data['user']=new_user
            new_employee = Employees.objects.create(**employee_data)
            serialized_employee_response = EmployeeGETSerializer(instance = new_employee, many=False)
            serialized_user_response = UserSerializer(instance = new_user, many = False)
            return Response({'User':serialized_user_response.data,"Employee":serialized_employee_response.data},status=status.HTTP_200_OK)

        return Response({'Error':'Invalid Data'},status=status.HTTP_200_OK)

@method_decorator(ensure_csrf_cookie, name = "post")
class LoginView(APIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.AllowAny,)
    def post(self,request):
        req_body = request.data

        """ DATA VALIDATION START """

        data_valid = True
        if not isinstance(req_body,dict):
            data_valid = False
        if req_body.get("username") == None:
            data_valid = False
        serialized_login = self.serializer_class(data = req_body, many = False)
        if not serialized_login.is_valid():
            data_valid = False
        if not data_valid:
            return Response({'Error':'Invalid Data'},status=status.HTTP_403_FORBIDDEN)

        """ DATA VALIDATION END """

        username = req_body["username"]
        #Here no need to use get method since passing serializer implies that these keys exist
        password=serialized_login.data['password']

        if not request.session.exists(request.session.session_key):
            request.session.create()

        data_valid = True
        user_query=User.objects.filter(username=username)
        if len(user_query) == 0:
            data_valid = False
        user = auth.authenticate(username=username, password=password)
        if user is None:
            data_valid = False
            
        if not data_valid:
            return Response({'Error': 'Invalid Credentials'}, status = status.HTTP_403_FORBIDDEN)

        auth.login(request, user)
        employee_query = Employees.objects.filter(user = request.user.id) #Should always
        employee_data = {}
        user_data = {}

        if len(employee_query) > 0:
            employee_data = dict(EmployeeGETSerializer(instance = employee_query[0], many = False).data)
            user_data = employee_data.pop('user')
        else:
            user_data = UserGetSerializer(instance = user, many=False).data
        return Response({'Success':{'user':user_data, 'employee':employee_data}})

@method_decorator(csrf_exempt,name="post")
class LogoutView(APIView):
    permission_classes = (permissions.AllowAny,)
    def post(self,request):
        try:
            auth.logout(request)
            return Response({'Success':'Logged Out'})
        except Exception as e:
            #TODO send email to Software team to solve server error
            return Response({'Error': 'Problem Logging Out'})

class CheckAuth(APIView):
    permission_classes = (permissions.AllowAny,)
    @method_decorator(csrf_exempt,name="get")
    # May not be necessary for production but good for debugging authentication
    def get(self, request):
        try:
            if not request.user.is_authenticated:
                return Response({'Error':"Not authenticated"})

            employee_query = Employees.objects.filter(user = request.user.id) #Should always
            employee_data = {}
            user_data = {}

            if len(employee_query) > 0:
                employee_data = dict(EmployeeGETSerializer(instance = employee_query[0], many = False).data)
                user_data = employee_data.pop('user')
            else:
                user = User.objects.get(id = request.user.id)
                user_data = UserGetSerializer(instance = user, many=False).data
            return Response({'Success':{'user':user_data, 'employee':employee_data}})

        except Exception as e:
            print(DEV.traceRelevantErrors(error_log=traceback.format_exc().split('File "'), script_loc=str(settings.ROOT_DIR), latest=False, exception = e))
            #TODO send email to IT Software team of severe server error to fix asap
            return Response(DEV.traceRelevantErrors(error_log=traceback.format_exc().split('File "'), script_loc=str(settings.ROOT_DIR), latest=False, exception = e), status = status.HTTP_500_INTERNAL_SERVER_ERROR)


    @method_decorator(csrf_exempt,name="post")
    def post(self,request):
        # Verify password for sensitive profile information updates
        req_body = request.data #Should contain only password string. Over HTTPS, this does not need to be salted from client side
        if not isinstance(req_body,str):
            return Response({"Error":"Data not valid"}, status = status.HTTP_403_FORBIDDEN)

        username = request.user #str dunder gives username 
        if username == 'AnonymousUser':
            return Response({"Error":"Must be signed for this security feature"}, status = status.HTTP_400_BAD_REQUEST)
            
        user_query=User.objects.filter(username=username) #No need to check length of queryset since any user not Anonymous is safe to assume as a registered user
        user = user_query[0] #Should only be one user object with unique username
        password_validate = user.check_password(request.data)

        if password_validate:
            return Response({'Success': 'Authenticated'},status=status.HTTP_200_OK)
        return Response({'Error':'Invalid Credentials'},status=status.HTTP_400_BAD_REQUEST)