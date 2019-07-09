import logging
import ckan.plugins.toolkit as toolkit
from ckan.common import c
import ckan.model as model
from ckan.lib.search import PackageSearchQuery
import shapely
import shapely.geometry
import json

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
    found = False
    for extra in dataset['extras']:
        if extra['key'] == u'spatial':
            extra['value'] = spatial
            found = True
    if not found:
        dataset['extras'].append({'key': 'spatial', 'value': spatial})
    log.debug('dataset extras after update: {}'.format(str(dataset['extras'])))
    toolkit.get_action('package_update')(context, dataset)


@toolkit.side_effect_free
def relational_search(context, data_dict):
    geometry = json.loads(data_dict['geometry'])
    type = data_dict['type']
    invert = ""

    if type == "Disjoint":
        invert = "-"
        type = "Intersects"

    log.debug('geometry: {}'.format(geometry))
    wkt = None

    # Check potential problems with bboxes
    if geometry['type'] == 'Polygon' \
       and len(geometry['coordinates']) == 1 \
       and len(geometry['coordinates'][0]) == 5:

        # Check wrong bboxes (4 same points)
        xs = [p[0] for p in geometry['coordinates'][0]]
        ys = [p[1] for p in geometry['coordinates'][0]]

        if xs.count(xs[0]) == 5 and ys.count(ys[0]) == 5:
            wkt = 'POINT({x} {y})'.format(x=xs[0], y=ys[0])
        else:
            # Check if coordinates are defined counter-clockwise,
            # otherwise we'll get wrong results from Solr
            lr = shapely.geometry.polygon.LinearRing(geometry['coordinates'][0])
            if not lr.is_ccw:
                lr.coords = list(lr.coords)[::-1]
            polygon = shapely.geometry.polygon.Polygon(lr)
            wkt = polygon.wkt

    if not wkt:
        shape = shapely.geometry.asShape(geometry)
        wkt = shape.wkt

    log.debug('wkt: {}'.format(wkt))
    fq = '{}spatial_geom:\"{}({})\"'.format(invert, type, wkt)
    fl = 'name title data_dict'
    query = PackageSearchQuery()
    q = {'fq': fq, 'fl': fl}
    query.run(q)
    return {'count': query.count, 'results': query.results}
