from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect, csrf_exempt
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializer import *
import django.contrib.auth as auth

@method_decorator(ensure_csrf_cookie,name='get')
class GetCSRFToken(APIView):
    permission_classes = (permissions.AllowAny,)
    def get(self, request):
        return Response({'Success': 'CSRF Cookie Set'})

@method_decorator(ensure_csrf_cookie, name = "post")
class LoginView(APIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.AllowAny,)
    def post(self,request):
        req_body = request.data
        if not isinstance(req_body,dict):
            return Response({"Error":"Data not compatible to database entries"}, status = status.HTTP_403_FORBIDDEN)
        serialized_login = self.serializer_class(data = req_body, many = False)
        if not serialized_login.is_valid():
            return Response({'Error': 'Invalid Credentials'}, status = status.HTTP_403_FORBIDDEN)
        
        #Here no need to use get method since passing serializer implies that these keys exist
        username=serialized_login.data['username']
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
    def get(self, request):
        if request.user.is_authenticated:
            return Response({'Success':'Authenticated'})
        return Response({'Auth_Error':'Not Authenicated'})

    @method_decorator(csrf_exempt,name="post")
    def post(self,request):
        req_body = request.data
        if not isinstance(req_body,dict):
            return Response({"Error":"Data not compatible to database entries"}, status = status.HTTP_403_FORBIDDEN)

        if req_body.get('username') == None:
            return Response({"Error":"Please supply username"}, status = status.HTTP_400_BAD_REQUEST)

        user_query=User.objects.filter(username=req_body['username'])
        if len(user_query) == 0:
            return Response({'Error':'Invalid Credentials'})

        user = user_query[0] #Should only be one user object with unique username
        password_validate = user.check_password(request.data)
        if password_validate == True:
            return Response({'Success': 'Authenticated'},status=status.HTTP_200_OK)
        return Response({'Error':'Invalid Credentials'},status=status.HTTP_400_BAD_REQUEST)