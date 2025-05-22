from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InscripcionViewSet, MateriaViewSet,EstudianteViewSet, UsuarioViewSet,GrupoViewSet,DocenteViewSet,CarreraViewSet,MateriaRequisitoViewSet
from .views_auth import CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView
from .views_auth import CustomTokenObtainPairView, CurrentUserView
from .views import ChatbotAPIView, DashboardAPIView

router = DefaultRouter()
router.register(r'inscripciones', InscripcionViewSet, basename='inscripcion')
router.register(r'materias', MateriaViewSet, basename='materia')
router.register(r'usuarios', UsuarioViewSet, basename='usuario')
router.register(r'grupos', GrupoViewSet, basename='grupo')
router.register(r'carreras', CarreraViewSet, basename='carrera')
router.register(r'docentes', DocenteViewSet, basename='docente')
router.register(r'estudiantes', EstudianteViewSet, basename='estudiantes')
router.register(r'materia-requisitos', MateriaRequisitoViewSet, basename='materia-requisitos')
urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', UsuarioViewSet.as_view({'get': 'current_user'}), name='current_user'),
    path('chatbot/', ChatbotAPIView.as_view(), name='chatbot'),
    path('dashboard/', DashboardAPIView.as_view(), name='dashboard'),
]