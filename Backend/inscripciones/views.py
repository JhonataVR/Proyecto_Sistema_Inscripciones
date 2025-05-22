from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db import models
from django.db.models import Count

from .models import *
from .serializers import *
from .permissions import *
from .chatbot import preguntar

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['rol', 'is_active']

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def current_user(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class CarreraViewSet(viewsets.ModelViewSet):
    queryset = Carrera.objects.all()
    serializer_class = CarreraSerializer
    permission_classes = [IsAdminOrReadOnly]

class MateriaViewSet(viewsets.ModelViewSet):
    queryset = Materia.objects.select_related('carrera')
    serializer_class = MateriaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['carrera', 'nivel']

class MateriaRequisitoViewSet(viewsets.ModelViewSet):
    queryset = MateriaRequisito.objects.select_related('materia', 'requisito')
    serializer_class = MateriaRequisitoSerializer
    permission_classes = [IsAdminOrReadOnly]

class DocenteViewSet(viewsets.ModelViewSet):
    queryset = Docente.objects.select_related('usuario')
    serializer_class = DocenteSerializer
    permission_classes = [IsAdminOrReadOnly]

class EstudianteViewSet(viewsets.ModelViewSet):
    queryset = Estudiante.objects.select_related('usuario', 'carrera')
    serializer_class = EstudianteSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['carrera', 'matricula']

    @action(detail=True, methods=['get'])
    def record_academico(self, request, pk=None):
        estudiante = self.get_object()
        serializer = RecordAcademicoSerializer(estudiante.record)
        return Response(serializer.data)

class GrupoViewSet(viewsets.ModelViewSet):
    queryset = Grupo.objects.select_related('materia', 'docente', 'docente__usuario')
    serializer_class = GrupoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['materia', 'docente', 'gestion', 'modalidad']

class IsEstudiante(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol == 'estudiante'

class InscripcionViewSet(viewsets.ModelViewSet):
    queryset = Inscripcion.objects.all()
    serializer_class = InscripcionSerializer
    permission_classes = [IsAuthenticated, IsEstudiante]

    def perform_create(self, serializer):
        estudiante = Estudiante.objects.get(usuario=self.request.user)
        grupo = serializer.validated_data['grupo']
        materia = grupo.materia

        # Obtener los requisitos de la materia
        requisitos = materia.requisitos_para.all().values_list('requisito', flat=True)
        # Obtener las materias aprobadas por el estudiante
        materias_aprobadas = estudiante.calificaciones.filter(
            resultado='Aprobado'
        ).values_list('grupo__materia', flat=True)

        # Verificar si faltan requisitos
        faltantes = set(requisitos) - set(materias_aprobadas)
        if faltantes:
            raise ValidationError("No cumple con los requisitos para inscribirse en esta materia.")

        serializer.save(estudiante=estudiante)

class CalificacionViewSet(viewsets.ModelViewSet):
    queryset = Calificacion.objects.select_related(
        'estudiante', 'estudiante__usuario', 'grupo', 'grupo__materia'
    )
    serializer_class = CalificacionSerializer
    permission_classes = [IsAdminOrDocenteOrSelf]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['estudiante', 'grupo', 'resultado']

    def perform_create(self, serializer):
        instance = serializer.save()
        instance.estudiante.actualizar_record()

class ChatbotAPIView(APIView):
    permission_classes = [AllowAny]  # <-- Esto permite acceso sin autenticación

    def post(self, request):
        pregunta = request.data.get('pregunta', '')
        if not pregunta:
            return Response({'error': 'No enviaste una pregunta.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            respuesta = preguntar(pregunta)
            return Response({'respuesta': respuesta})
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class DashboardAPIView(APIView):
    permission_classes = [AllowAny]  # <-- Permite acceso sin autenticación

    def get(self, request):
        total_estudiantes = Estudiante.objects.count()
        total_docentes = Docente.objects.count()
        estudiantes_por_materia = (
            Materia.objects.annotate(total=Count('grupos__inscripciones__estudiante', distinct=True))
            .values('nombre', 'total')
            .order_by('nombre')
        )
        docentes_por_materia = (
            Materia.objects.annotate(total=Count('grupos__docente', distinct=True))
            .values('nombre', 'total')
            .order_by('nombre')
        )
        return Response({
            "total_estudiantes": total_estudiantes,
            "total_docentes": total_docentes,
            "estudiantes_por_materia": list(estudiantes_por_materia),
            "docentes_por_materia": list(docentes_por_materia),
        })

@api_view(['GET'])
def dashboard_data(request):
    total_estudiantes = Estudiante.objects.count()
    total_docentes = Docente.objects.count()

    estudiantes_por_materia = (
        Materia.objects.annotate(total=Count('grupos__inscripciones__estudiante', distinct=True))
        .values('nombre', 'total')
        .order_by('nombre')
    )

    docentes_por_materia = (
        Materia.objects.annotate(total=Count('grupos__docente', distinct=True))
        .values('nombre', 'total')
        .order_by('nombre')
    )

    return Response({
        "total_estudiantes": total_estudiantes,
        "total_docentes": total_docentes,
        "estudiantes_por_materia": list(estudiantes_por_materia),
        "docentes_por_materia": list(docentes_por_materia),
    })
