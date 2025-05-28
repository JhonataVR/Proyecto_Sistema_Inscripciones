from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator

class UsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El email es obligatorio')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(email, password, **extra_fields)

class Usuario(AbstractUser):
    class Rol(models.TextChoices):
        ESTUDIANTE = 'estudiante', 'Estudiante'
        DOCENTE = 'docente', 'Docente'
        ADMIN = 'admin', 'Administrador'

    username = None
    email = models.EmailField(unique=True)
    rol = models.CharField(max_length=20, choices=Rol.choices)
    ci = models.CharField(max_length=20, unique=True)
    telefono = models.CharField(max_length=20, blank=True)
    direccion = models.CharField(max_length=255, blank=True)

    objects = UsuarioManager()  # type: ignore

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

# 2. Modelos académicos mejorados
class Carrera(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)
    duracion = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(20)],
        help_text="Duración en semestres"
    )
    
    def __str__(self):
        return self.nombre

class Materia(models.Model):
    nombre = models.CharField(max_length=100)
    sigla_validator = RegexValidator(
        regex=r'^[A-Z]{2,3}\d{3}$',
        message='La sigla debe tener 2-3 letras mayúsculas seguidas de 3 números'
    )
    
    sigla = models.CharField(
        max_length=20,
        unique=True,
        validators=[sigla_validator]
    )
    creditos = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(20)]
    )
    horas_academicas = models.PositiveSmallIntegerField()
    nivel = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(20)]
    )
    carrera = models.ForeignKey(
        Carrera,
        on_delete=models.CASCADE,
        related_name='materias'
    )
    
    class Meta:
        ordering = ['nivel', 'nombre']
        verbose_name_plural = 'Materias'
    
    def __str__(self):
        return f"{self.sigla} - {self.nombre}"

class MateriaRequisito(models.Model):
    materia = models.ForeignKey(
        Materia,
        on_delete=models.CASCADE,
        related_name='requisitos_para'
    )
    requisito = models.ForeignKey(
        Materia,
        on_delete=models.CASCADE,
        related_name='es_requisito_de'
    )
    
    class Meta:
        unique_together = ('materia', 'requisito')
        verbose_name_plural = 'Requisitos de materias'
    
    def __str__(self):
        return f"{self.requisito} es requisito de {self.materia}"

# 3. Modelos de personas mejorados
class Estudiante(models.Model):
    usuario = models.OneToOneField(
        Usuario,
        on_delete=models.CASCADE,
        limit_choices_to={'rol': Usuario.Rol.ESTUDIANTE}
    )
    matricula_validator = RegexValidator(
        regex=r'^[A-Z]{2}\d{4}$',
        message='La matrícula debe tener 2 letras mayúsculas y 4 números'
    )
    
    matricula = models.CharField(
        max_length=20,
        unique=True,
        validators=[matricula_validator]
    )
    carrera = models.ForeignKey(
        Carrera,
        on_delete=models.PROTECT,
        related_name='estudiantes'
    )
    fecha_ingreso = models.DateField()
    
    def actualizar_record(self):
        """Actualiza automáticamente el record académico del estudiante"""
        from django.db.models import Count, Sum, Avg
        from django.db.models.functions import Coalesce
        
        # Obtener todas las calificaciones del estudiante
        calificaciones = self.calificaciones.all()
        
        # Calcular estadísticas
        stats = calificaciones.aggregate(
            total_aprobadas=Count('id', filter=models.Q(resultado='Aprobado')),
            total_reprobadas=Count('id', filter=models.Q(resultado='Reprobado')),
            total_creditos=Sum('grupo__materia__creditos', filter=models.Q(resultado='Aprobado')),
            promedio=Coalesce(Avg('nota', filter=models.Q(resultado='Aprobado')), 0.0)
        )
        
        # Actualizar o crear el record
        record, created = RecordAcademico.objects.update_or_create(
            estudiante=self,
            defaults={
                'materias_aprobadas': stats['total_aprobadas'],
                'materias_reprobadas': stats['total_reprobadas'],
                'total_creditos': stats['total_creditos'] or 0,
                'promedio_general': stats['promedio']
            }
        )
    def __str__(self):
        return f"{self.matricula} - {self.usuario.get_full_name()}"

class Docente(models.Model):
    usuario = models.OneToOneField(
        Usuario,
        on_delete=models.CASCADE,
        limit_choices_to={'rol': Usuario.Rol.DOCENTE}
    )
    titulo = models.CharField(max_length=100)
    especialidad = models.CharField(max_length=100)
    fecha_contratacion = models.DateField()
    
    def __str__(self):
        return f"{self.usuario.get_full_name()} - {self.titulo}"

# 4. Modelos de gestión académica mejorados
class Grupo(models.Model):
    materia = models.ForeignKey(
        Materia,
        on_delete=models.CASCADE,
        related_name='grupos'
    )
    docente = models.ForeignKey(
        Docente,
        on_delete=models.PROTECT,
        related_name='grupos'
    )
    paralelo = models.CharField(max_length=5)
    gestion_validator = RegexValidator(
        regex=r'^20\d{2}-20\d{2}$',
        message='Formato de gestión: YYYY-YYYY'
    )
    
    gestion = models.CharField(
        max_length=10,
        validators=[gestion_validator]
    )
    modalidad = models.CharField(
        max_length=20,
        choices=[
            ('presencial', 'Presencial'),
            ('virtual', 'Virtual'),
            ('hibrido', 'Híbrido')
        ]
    )
    cupo = models.PositiveSmallIntegerField(default=30)
    
    class Meta:
        unique_together = ('materia', 'paralelo', 'gestion')
    
    def __str__(self):
        return f"{self.materia} - {self.paralelo} ({self.gestion})"

class Inscripcion(models.Model):
    estudiante = models.ForeignKey(
        Estudiante,
        on_delete=models.CASCADE,
        related_name='inscripciones'
    )
    grupo = models.ForeignKey(
        Grupo,
        on_delete=models.CASCADE,
        related_name='inscripciones'
    )
    fecha_inscripcion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('estudiante', 'grupo')
        verbose_name_plural = 'Inscripciones'
    
    def __str__(self):
        return f"{self.estudiante} en {self.grupo}"

# 5. Modelos de notas con señales para actualización automática
class Calificacion(models.Model):
    estudiante = models.ForeignKey(
        Estudiante,
        on_delete=models.CASCADE,
        related_name='calificaciones'
    )
    grupo = models.ForeignKey(
        Grupo,
        on_delete=models.CASCADE,
        related_name='calificaciones'
    )
    nota = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    class Resultado(models.TextChoices):
        APROBADO = 'Aprobado', 'Aprobado'
        REPROBADO = 'Reprobado', 'Reprobado'
    
    resultado = models.CharField(
        max_length=20,
        choices=Resultado.choices,
        editable=False  # Se calcula automáticamente
    )
    
    class Meta:
        unique_together = ('estudiante', 'grupo')
        verbose_name_plural = 'Calificaciones'
    
    def save(self, *args, **kwargs):
        # Calcula automáticamente el resultado
        self.resultado = self.Resultado.APROBADO if self.nota >= 60 else self.Resultado.REPROBADO
        super().save(*args, **kwargs)
        
        # Actualiza el record académico del estudiante
        self.estudiante.actualizar_record()
    
    def __str__(self):
        return f"{self.estudiante} - {self.nota} ({self.resultado})"

class RecordAcademico(models.Model):
    estudiante = models.OneToOneField(
        Estudiante,
        on_delete=models.CASCADE,
        related_name='record'
    )
    materias_aprobadas = models.PositiveSmallIntegerField(default=0)
    materias_reprobadas = models.PositiveSmallIntegerField(default=0)
    total_creditos = models.PositiveSmallIntegerField(default=0)
    promedio_general = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=0.00
    )
    
    def __str__(self):
        return f"Record de {self.estudiante} - Promedio: {self.promedio_general}"
    
    def actualizar(self):
        calificaciones = self.estudiante.calificaciones.all()
        aprobadas = calificaciones.filter(resultado=Calificacion.Resultado.APROBADO)
        
        self.materias_aprobadas = aprobadas.count()
        self.materias_reprobadas = calificaciones.count() - self.materias_aprobadas
        
        if aprobadas.exists():
            self.total_creditos = sum(
                cal.grupo.materia.creditos 
                for cal in aprobadas
            )
            self.promedio_general = sum(
                cal.nota * cal.grupo.materia.creditos
                for cal in aprobadas
            ) / self.total_creditos
        else:
            self.total_creditos = 0
            self.promedio_general = 0.00
        
        self.save()

# Señales para mantener la integridad de los datos
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Estudiante)
def crear_record_academico(sender, instance, created, **kwargs):
    if created:
        RecordAcademico.objects.create(estudiante=instance)

@receiver(post_save, sender=Calificacion)
def actualizar_record_despues_calificacion(sender, instance, **kwargs):
    instance.estudiante.record.actualizar()

# Método adicional para Estudiante
def actualizar_record(self):
    self.record.actualizar()

Estudiante.actualizar_record = actualizar_record