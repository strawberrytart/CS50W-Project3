from django.contrib import admin
from .models import User, Email


class UserAdmin(admin.ModelAdmin):
    list_display = ["username", "email"]

class EmailAdmin(admin.ModelAdmin):
    list_display =["user", "sender", "subject", "timestamp", "read","archived"]
    filter_horizontal = ('recipients',)


# Register your models here.
admin.site.register(Email, EmailAdmin)
admin.site.register(User, UserAdmin)

