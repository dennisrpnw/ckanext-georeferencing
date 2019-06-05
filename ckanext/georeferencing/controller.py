from ckan.controllers.package import PackageController
from ckan.plugins.toolkit import render, abort
from ckan.common import c, request, _
import ckan.model as model
import ckan.logic as logic

get_action = logic.get_action
check_access = logic.check_access
NotFound = logic.NotFound
NotAuthorized = logic.NotAuthorized


class GeoreferencingController(PackageController):

    def edit_georeferencing(self, id, data=None, errors=None, error_summary=None):
        package_type = self._get_package_type(id)
        context = {'model': model, 'session': model.Session,
                   'user': c.user, 'auth_user_obj': c.userobj,
                   'save': 'save' in request.params}
        try:
            c.pkg_dict = get_action('package_show')(dict(context,
                                                         for_view=True),
                                                    {'id': id})
            context['for_edit'] = True
            old_data = get_action('package_show')(context, {'id': id})
            # old data is from the database and data is passed from the
            # user if there is a validation error. Use users data if there.
            if data:
                old_data.update(data)
            data = old_data
        except (NotFound, NotAuthorized):
            abort(404, _('Dataset not found'))
        try:
            check_access('package_update', context)
        except NotAuthorized:
            abort(403, _('User %r not authorized to edit %s') % (c.user, id))
        return render('georeferencing/edit.html', extra_vars={'id': id})
