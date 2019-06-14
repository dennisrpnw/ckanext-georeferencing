import logging
import ckan.plugins.toolkit as toolkit
from ckan.common import c
import ckan.model as model


log = logging.getLogger(__name__)


@toolkit.side_effect_free
def update_spatial(context, data_dict):
    id = data_dict['id']
    spatial = data_dict['spatial']
    log.debug('spatial {} | id {}'.format(spatial, id))
    log.debug('user: {} | auth_user_obj: {}'.format(c.user, c.userobj))
    context = {'model': model, 'session': model.Session,
                   'user': c.user, 'for_view': True,
                   'auth_user_obj': c.userobj}
    try:
        dataset = toolkit.get_action('package_show')(context, {'id': id})
    except Exception, e:
        log.error('ERROR ' + str(e))
    log.debug('dataset extras before update: {}'.format(str(dataset['extras'])))
    for extra in dataset['extras']:
        if extra['key'] == u'spatial':
            extra['value'] = spatial
    log.debug('dataset extras after update: {}'.format(str(dataset['extras'])))
    toolkit.get_action('package_update')(context, dataset)
