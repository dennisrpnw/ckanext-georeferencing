from ckan.controllers.package import PackageController
from ckan.plugins.toolkit import render, abort
from ckan.common import c, request, _
import ckan.model as model
import ckan.logic as logic
import ckan.lib.helpers as h

get_action = logic.get_action
check_access = logic.check_access
NotFound = logic.NotFound
NotAuthorized = logic.NotAuthorized


class GeoreferencingController(PackageController):

    def view_georeferencing(self, data=None, errors=None, error_summary=None):
        return render('georeferencing/search.html')

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

    def save_georeferencing(self, id):
        context = {'model': model, 'session': model.Session,
                   'user': c.user, 'auth_user_obj': c.userobj}

        try:
            c.pkg_dict = get_action('package_show')(context, {'id': id})
            dataset_type = c.pkg_dict['type'] or 'dataset'
            h.flash_notice(_('Test'))
        except NotAuthorized:
            abort(403, _('Unauthorized to delete package %s') % '')
        except NotFound:
            abort(404, _('Dataset not found'))

    def org_edit_georeferencing(self, id, data=None, errors=None, error_summary=None):
        context = {'model': model, 'session': model.Session,
                   'user': c.user, 'auth_user_obj': c.userobj,
                   'save': 'save' in request.params}
        try:
            c.group_dict = get_action('organization_show')(dict(context,
                                                         for_view=True),
                                                    {'id': id})
            context['for_edit'] = True
            old_data = get_action('organization_show')(context, {'id': id})
            # old data is from the database and data is passed from the
            # user if there is a validation error. Use users data if there.
            if data:
                old_data.update(data)
            data = old_data
        except (NotFound, NotAuthorized):
            abort(404, _('Organization not found'))
        try:
            check_access('organization_update', context)
        except NotAuthorized:
            abort(403, _('User %r not authorized to edit %s') % (c.user, id))
        return render('georeferencing/org_edit.html', extra_vars={'id': id})
