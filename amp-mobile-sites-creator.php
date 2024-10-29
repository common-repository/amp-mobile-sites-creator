<?php if ( ! defined( 'ABSPATH' ) ) exit;
/**
 * Plugin Name: AMP Mobile Sites Creator - Hosting and AMP CMS Sign-up
 * Plugin URI: https://wordpress.org/plugins/amp-mobile-sites-creator/
 * Description: This plug-in creates an AMP mobile site hosted on Amazon hosting on the FastAMPsites.com platform. There is a 1 week free trial that then converts to a paid account starting at $79 a month (up to 10K visitor) to use the FastAMPsites CMS and hosting.
 * Version: 1.0.6
 * Author: FastAMPsites
 * Author URI: https://www.fastampsites.com/
 * License: GPL2
 */

add_action('admin_menu', 'amp_creator_options_page');
add_action('wp_head', 'amp_creator_admin_head');
add_filter('wp_headers', 'amp_creator_mobile_redirect');

function amp_creator_options_page()
{
    add_menu_page(
        'AMP Creator',
        'AMP Creator',
        'manage_options',
        'amp_creator',
        'amp_creator_page_html',
        plugin_dir_url(__FILE__) . 'img/icon_amp.png',
        20
    );
}

function amp_creator_page_html()
{
    // save settings
    if(isset($_POST['fas-used-amp']) && isset($_POST['fas-amp-url']))
    {
        $fas_used_amp = sanitize_text_field($_POST['fas-used-amp']);
        $fas_amp_url = esc_url($_POST['fas-amp-url']);

        if(!isset($_GET['_wpnonce']) || !wp_verify_nonce($_GET['_wpnonce']) || !$fas_used_amp
            || $fas_used_amp == 'true' && !$fas_amp_url)
        {
            echo 'error';
            return;
        }

        update_option('fas-used-amp', $fas_used_amp, true);
        update_option('fas-amp-url', $fas_amp_url, true);
        return;
    }

    wp_enqueue_style('jquery.phpdiffmerge.css', plugins_url('css/jquery.phpdiffmerge.css', __FILE__));
    wp_enqueue_style('styles.css', plugins_url('css/styles.css', __FILE__));

    $data = [];
    $pages_data = get_pages();
    $post_data = get_posts(['post_type' => 'post']);
    $product_data = get_posts(['post_type' => 'product']);
    $pages_data = array_merge($pages_data, $post_data, $product_data);
    foreach ($pages_data as $page)
        $data['pages'][] = [
            'name' => $page->post_name,
            'url' => get_page_link($page->ID)
        ];

    $data['projectName'] = $project_name = $_SERVER['HTTP_HOST'];
    $used_amp = get_option('fas-used-amp');

    require_once('page-creator.php');

    wp_enqueue_script('jquery');
    wp_enqueue_script('jquery.phpdiffmerge.js', plugins_url('js/jquery.phpdiffmerge.js', __FILE__));
    wp_enqueue_script('scripts.js', plugins_url('js/scripts.js', __FILE__));
    wp_localize_script('scripts.js', 'siteData', [
        'wpnonce' => wp_nonce_url(''),
        'data' => json_encode($data),
        'plugin_url' => plugin_dir_url(__FILE__)
    ]);
}

function amp_creator_admin_head() {
	$fas_amp_url = get_option('fas-amp-url');
    if(get_option('fas-used-amp') == 'true' && !empty($fas_amp_url)) {
		$page = ($_SERVER[REQUEST_URI] == '/') ? '/' : rtrim($_SERVER[REQUEST_URI], '/').'.html';
        echo '<link rel="amphtml" href="'.$fas_amp_url.$page.'">';
	}
}

function amp_creator_mobile_redirect()
{
    $fas_amp_url = get_option('fas-amp-url');
    if(get_option('fas-used-amp') == 'true' && !empty($fas_amp_url))
    {
        require_once('Mobile_Detect.php');
        $detect = new Mobile_Detect();

        if($detect->isMobile()) {
			$page = ($_SERVER[REQUEST_URI] == '/') ? '/' : rtrim($_SERVER[REQUEST_URI], '/').'.html';
            header('Location: '.get_option('fas-amp-url').$page);
            exit;
        }
    }
}

