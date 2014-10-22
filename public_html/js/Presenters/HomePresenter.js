var App = App || {};
App.Presenters = App.Presenters || {};

App.Presenters.HomePresenter = function(
	jQuery,
	util,
	promise,
	api,
	auth,
	presenterManager,
	postContentPresenter,
	topNavigationPresenter,
	messagePresenter) {

	var $el = jQuery('#content');
	var templates = {};
	var globals;
	var post;

	function init(params, loaded) {
		topNavigationPresenter.select('home');
		topNavigationPresenter.changeTitle('Home');

		promise.wait(
				util.promiseTemplate('home'),
				api.get('/globals'),
				api.get('/posts/featured'))
			.then(function(
					homeTemplate,
					globalsResponse,
					featuredPostResponse) {
				templates.home = homeTemplate;

				globals = globalsResponse.json;
				post = featuredPostResponse.json.id ? featuredPostResponse.json : null;
				render();
				loaded();

				presenterManager.initPresenters([
					[postContentPresenter, {post: post, $target: $el.find('#post-content-target')}]],
					function() {});

			}).fail(function(response) {
				messagePresenter.showError($el, response.json && response.json.error || response);
				loaded();
			});
	}

	function render() {
		$el.html(templates.home({
			post: post,
			globals: globals,
			title: topNavigationPresenter.getBaseTitle(),
			canViewUsers: auth.hasPrivilege(auth.privileges.viewUsers),
			canViewPosts: auth.hasPrivilege(auth.privileges.viewPosts),
			formatRelativeTime: util.formatRelativeTime,
			formatFileSize: util.formatFileSize,
			version: jQuery('head').attr('data-version'),
			buildTime: jQuery('head').attr('data-build-time'),
		}));
	}

	return {
		init: init,
		render: render,
	};

};

App.DI.register('homePresenter', [
	'jQuery',
	'util',
	'promise',
	'api',
	'auth',
	'presenterManager',
	'postContentPresenter',
	'topNavigationPresenter',
	'messagePresenter'],
	App.Presenters.HomePresenter);
