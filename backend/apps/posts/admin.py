from django.contrib import admin
from django.utils.html import format_html
from .models import Post, PostMedia


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('author', 'created_at', 'updated_at')
    list_filter = ('created_at',)


@admin.register(PostMedia)
class PostMediaAdmin(admin.ModelAdmin):
    list_display = ('post', 'media_type', 'media_preview', 'created_at')
    readonly_fields = ('media_preview_full',)
    fieldsets = (
        ('Information', {
            'fields': ('post', 'media_type', 'file', 'order')
        }),
        ('Preview', {
            'fields': ('media_preview_full',)
        }),
    )
    
    def media_preview(self, obj):
        if obj.media_type == 'image':
            return format_html(
                '<img src="{}" width="50" height="50" style="object-fit: cover;" />',
                obj.file.url
            )
        elif obj.media_type == 'video':
            return format_html(
                '<video width="50" height="50" style="object-fit: cover;"><source src="{}" /></video>',
                obj.file.url
            )
        return 'Unknown'
    media_preview.short_description = 'Preview'
    
    def media_preview_full(self, obj):
        if obj.media_type == 'image':
            return format_html(
                '<img src="{}" style="max-width: 400px;" />',
                obj.file.url
            )
        elif obj.media_type == 'video':
            return format_html(
                '<video width="400" controls><source src="{}" /></video>',
                obj.file.url
            )
        return 'Unknown'
    media_preview_full.short_description = 'Preview'
