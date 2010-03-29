from django.conf.urls.defaults import *

urlpatterns = patterns('concertapp.concert.views',
    url(r'^$', 'posts', name='posts'),
    # Users
    url(r'^users/$', 'users', name='users'),
    url(r'^users/add/$', 'create_user', name='create_user'),
    # Audio
    url(r'^audio/$', 'audio', name='audio'),
    url(r'^audio/upload/$', 'upload_audio', name='upload_audio'),
    # Blog content
    url(r'^add/$','create_post', name='create_post'),
    url(r'^ajaxy_add/$','create_ajaxy_post', name='create_ajaxy_post'),
)