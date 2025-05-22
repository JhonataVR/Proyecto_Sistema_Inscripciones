from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import *
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        refresh = self.get_token(self.user)
        
        # Add custom claims
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'rol': self.user.rol,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name
        }
        return data

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            'id', 'email', 'password', 'first_name', 'last_name', 'ci',
            'telefono', 'direccion', 'rol', 'is_active'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'is_active': {'read_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = Usuario(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

class CarreraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Carrera
        fields = '__all__'

class MateriaSerializer(serializers.ModelSerializer):
    carrera_nombre = serializers.CharField(source='carrera.nombre', read_only=True)
    
    class Meta:
        model = Materia
        fields = ['id', 'nombre', 'sigla', 'creditos', 'horas_academicas', 'nivel', 'carrera', 'carrera_nombre']

class MateriaRequisitoSerializer(serializers.ModelSerializer):
    materia_nombre = serializers.CharField(source='materia.nombre', read_only=True)
    requisito_nombre = serializers.CharField(source='requisito.nombre', read_only=True)

    class Meta:
        model = MateriaRequisito
        fields = ['id', 'materia', 'materia_nombre', 'requisito', 'requisito_nombre']

class DocenteSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(read_only=True)
    usuario_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.filter(rol='docente'),
        source='usuario',
        write_only=True
    )
    
    class Meta:
        model = Docente
        fields = ['id', 'usuario', 'usuario_id', 'titulo', 'especialidad', 'fecha_contratacion']

class EstudianteSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(read_only=True)
    usuario_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.filter(rol='estudiante'),
        source='usuario',
        write_only=True
    )
    carrera_nombre = serializers.CharField(source='carrera.nombre', read_only=True)
    
    class Meta:
        model = Estudiante
        fields = [
            'id', 'usuario', 'usuario_id', 'matricula', 
            'carrera', 'carrera_nombre', 'fecha_ingreso'
        ]

class GrupoSerializer(serializers.ModelSerializer):
    materia_nombre = serializers.CharField(source='materia.nombre', read_only=True)
    docente_nombre = serializers.SerializerMethodField()
    cupo_disponible = serializers.SerializerMethodField()

    class Meta:
        model = Grupo
        fields = [
            'id', 'materia', 'materia_nombre', 'docente', 'docente_nombre',
            'paralelo', 'gestion', 'modalidad', 'cupo', 'cupo_disponible'
        ]

    def get_docente_nombre(self, obj):
        return f"{obj.docente.usuario.first_name} {obj.docente.usuario.last_name}"

    def get_cupo_disponible(self, obj):
        return obj.cupo - obj.inscripciones.count()

class InscripcionSerializer(serializers.ModelSerializer):
    materia_nombre = serializers.CharField(source='grupo.materia.nombre', read_only=True)
    grupo_paralelo = serializers.CharField(source='grupo.paralelo', read_only=True)
    grupo_gestion = serializers.CharField(source='grupo.gestion', read_only=True)
    docente_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Inscripcion
        fields = ['id', 'estudiante', 'grupo', 'materia_nombre', 'grupo_paralelo', 'grupo_gestion', 'docente_nombre']
        read_only_fields = ['estudiante', 'materia_nombre', 'grupo_paralelo', 'grupo_gestion', 'docente_nombre']

    def get_docente_nombre(self, obj):
        return f"{obj.grupo.docente.usuario.first_name} {obj.grupo.docente.usuario.last_name}"

class CalificacionSerializer(serializers.ModelSerializer):
    estudiante_nombre = serializers.CharField(source='estudiante.usuario.get_full_name', read_only=True)
    materia_nombre = serializers.CharField(source='grupo.materia.nombre', read_only=True)

    class Meta:
        model = Calificacion
        fields = [
            'id', 'estudiante', 'estudiante_nombre', 'grupo', 'materia_nombre',
            'nota', 'resultado'
        ]

class RecordAcademicoSerializer(serializers.ModelSerializer):
    estudiante_nombre = serializers.CharField(source='estudiante.usuario.get_full_name', read_only=True)
    carrera_nombre = serializers.CharField(source='estudiante.carrera.nombre', read_only=True)

    class Meta:
        model = RecordAcademico
        fields = [
            'id', 'estudiante', 'estudiante_nombre', 'carrera_nombre',
            'materias_aprobadas', 'materias_reprobadas', 'total_creditos', 'promedio_general'
        ]

    def validate(self, data):
        estudiante = data['estudiante']
        materia = data['materia']

        # 1. Verificar si el estudiante ya está inscrito en la materia
        if Inscripcion.objects.filter(estudiante=estudiante, materia=materia).exists():
            raise serializers.ValidationError("Ya estás inscrito en esta materia.")

        # 2. Validar prerrequisitos
        requisitos = MateriaRequisito.objects.filter(materia=materia)
        for req in requisitos:
            if not Calificacion.objects.filter(
                estudiante=estudiante,
                grupo__materia=req.requisito,
                resultado='Aprobado'
            ).exists():
                raise serializers.ValidationError(
                    f"No cumple el requisito: {req.requisito.nombre}"
                )

        return data