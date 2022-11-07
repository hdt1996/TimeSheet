from rest_framework.serializers import ModelSerializer
import rest_framework.serializers as serializers
serializers.Serializer
from django.contrib.auth.models import User
class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        exclude = ('username',)