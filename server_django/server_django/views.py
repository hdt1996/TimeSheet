from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect, csrf_exempt
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializer import *
import django.contrib.auth as auth
from app_payroll.models import *
from app_payroll.serializer import *

@method_decorator(ensure_csrf_cookie,name='get')
class GetCSRFToken(APIView):
    permission_classes = (permissions.AllowAny,)
    def get(self, request):
        return Response({'Success': 'CSRF Cookie Set'})

class CreateLoginView(APIView):
    permission_classes = (permissions.AllowAny,)
    def post(self,request): #Endpoint for creating users and employee accounts. Assume that this web service is only accessible to internal users
        """ if not request.session.exists(request.session.session_key): # if user has not been previously viewed site
            request.session.create()
            print('\n\n session created... \n\n') """
        user_data = request.data['user']
        employee_data=request.data['employee']

        if not isinstance(user_data,dict) or not isinstance(employee_data,dict):
            return Response({"Error":"Request body not valid"}, status = status.HTTP_403_FORBIDDEN)
        if user_data.get('username') == None or user_data.get('password') == None:
            return Response({'Error':'Missing Data for Creation'},status=status.HTTP_403_FORBIDDEN)
        serialized_user = UserSerializer(data=user_data, many = False)

        employee_data['name'] = f"{user_data['first_name']} {user_data['last_name']}"
        if serialized_user.is_valid() == False:
            return Response({'Error':'Invalid Data'},status=status.HTTP_400_BAD_REQUEST)
        username = user_data.pop('username')
        password = user_data.pop('password')
        user_query = User.objects.filter(username=username)
        if serialized_user.is_valid() == False:
            return Response({'Error':'Invalid Data'},status=status.HTTP_400_BAD_REQUEST)
        if len(user_query) == 0: #Means user does not exist, so okay to create new account
            try:
                auth.password_validation.validate_password(password)
            except Exception as e:
                return Response({'Error':e})
            serialized_employee = EmployeePOSTSerializer(data=employee_data, many = False)
            if serialized_employee.is_valid() == False:
                print(serialized_employee.errors)
                return Response({'Error':'Invalid Data'},status=status.HTTP_403_FORBIDDEN)
            new_user = User.objects.create(username=username)
            new_user.set_password(password)
            new_user.save()
            employee_data['user']=new_user
            new_employee = Employees.objects.create(**employee_data)
            serialized_employee_response = EmployeeGETSerializer(instance = new_employee, many=False)
            serialized_user_response = UserSerializer(instance = new_user, many = False)
            return Response({'User':serialized_user_response.data,"Employee":serialized_employee_response.data},status=status.HTTP_200_OK)
        return Response({'Error':'TEST Invalid Data'},status=status.HTTP_200_OK)

@method_decorator(ensure_csrf_cookie, name = "post")
class LoginView(APIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.AllowAny,)
    def post(self,request):
        req_body = request.data
        if not isinstance(req_body,dict):
            return Response({"Error":"Request body not valid"}, status = status.HTTP_403_FORBIDDEN)
        username = req_body.get("username")
        if username == None:
            return Response({'Error': 'Missing username'}, status = status.HTTP_403_FORBIDDEN)

        serialized_login = self.serializer_class(data = req_body, many = False)
        if not serialized_login.is_valid():
            print(serialized_login.errors)
            return Response({'Error': 'Data invalid by serializer'}, status = status.HTTP_403_FORBIDDEN)
        print(serialized_login.data)
        #Here no need to use get method since passing serializer implies that these keys exist
        password=serialized_login.data['password']

        if not request.session.exists(request.session.session_key):
            request.session.create()

        user_query=User.objects.filter(username=username)
        if len(user_query) == 0:
            return Response({'Error': 'Invalid Credentials'}, status = status.HTTP_403_FORBIDDEN)
        user = auth.authenticate(username=username, password=password)
        if user is not None:
            auth.login(request, user)
            return Response({'Success':'Authenticated'}, status = status.HTTP_200_OK)
        else:
            return Response({'Error': 'Invalid Credentials'}, status = status.HTTP_403_FORBIDDEN)

@method_decorator(csrf_exempt,name="post")
class LogoutView(APIView):
    permission_classes = (permissions.AllowAny,)
    def post(self,request):
        auth.logout(request)
        try:
            return Response({'Session':'Logged Out'})
        except Exception as e:
            #TODO send email to Software team to solve server error
            return Response({'Error': 'Problem Logging Out'})

class CheckAuth(APIView):
    permission_classes = (permissions.AllowAny,)
    @method_decorator(csrf_exempt,name="get")
    # May not be necessary for production but good for debugging authentication
    def get(self, request):
        if request.user.is_authenticated:
            return Response({'Success':'Still Authenticated'})
        return Response({'Error':'Need Authenication'})

    @method_decorator(csrf_exempt,name="post")
    def post(self,request):
        # Verify password for sensitive profile information updates
        req_body = request.data #Should contain only password string. Over HTTPS, this does not need to be salted from client side
        if not isinstance(req_body,str):
            return Response({"Error":"Request body not valid"}, status = status.HTTP_403_FORBIDDEN)
        username = request.user 
        if username == 'AnonymousUser':
            return Response({"Error":"Must be signed for this security feature"}, status = status.HTTP_400_BAD_REQUEST)
        user_query=User.objects.filter(username=username) #No need to check length of queryset since any user not Anonymous is safe to assume as a registered user
        user = user_query[0] #Should only be one user object with unique username
        password_validate = user.check_password(request.data)

        if password_validate:
            return Response({'Success': 'Authenticated'},status=status.HTTP_200_OK)
        return Response({'Error':'Invalid Credentials'},status=status.HTTP_400_BAD_REQUEST)