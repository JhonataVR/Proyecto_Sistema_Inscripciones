from django.contrib import admin
from .models import Usuario, Materia, Inscripcion, Grupo, Carrera, MateriaRequisito,Docente,Estudiante,Calificacion
from django.contrib.auth.models import Group

admin.site.register(Usuario)
admin.site.register(Materia)
admin.site.register(Inscripcion)
admin.site.register(Grupo)
admin.site.register(Carrera)
admin.site.register(MateriaRequisito)
admin.site.register(Docente)
admin.site.register(Estudiante)
admin.site.register(Calificacion)