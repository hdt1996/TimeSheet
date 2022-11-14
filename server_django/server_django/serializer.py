from rest_framework.serializers import ModelSerializer
import rest_framework.serializers as serializers
serializers.Serializer
from django.contrib.auth.models import User
class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        exclude = ('username',)

class UserGetSerializer(ModelSerializer):
    username = serializers.SerializerMethodField("get_username")
    def get_username(self, obj):
        return obj.username
    class Meta:
        model = User
        fields = ('id','username','first_name','last_name', 'is_superuser')