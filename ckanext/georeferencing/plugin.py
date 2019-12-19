import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit
import ckanext.georeferencing.logic.action as action


class GeoreferencingPlugin(plugins.SingletonPlugin):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.IRoutes, inherit=True)
    plugins.implements(plugins.IActions)

    # IConfigurer

    def update_config(self, config_):
        toolkit.add_template_directory(config_, 'templates')
        toolkit.add_public_directory(config_, 'public')
        toolkit.add_resource('fanstatic', 'georeferencing')
        toolkit.add_resource('public', 'ckanext-georeferencing')

    # IRoutes

    def before_map(self, map):
        controller = 'ckanext.georeferencing.controller:GeoreferencingController'
        map.connect('georeferencing', '/georeferencing', controller=controller, action='view_georeferencing')
        map.connect('georeferencing_edit', '/georeferencing/edit/{id}', controller=controller, action='edit_georeferencing')
        map.connect('georeferencing_save', controller=controller, action='save_georeferencing')
        map.connect('georeferencing_org_edit', '/georeferencing/org_edit/{id}', controller=controller, action='org_edit_georeferencing')
        return map

    # IAction

    def get_actions(self):
        return {'update_spatial': action.update_spatial,
                'relational_search': action.relational_search,
                'get_districts': action.get_districts}
