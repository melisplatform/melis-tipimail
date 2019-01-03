<?php

return array(
    'plugins' => array(
        'meliscore' => array(
            'interface' => array(
                'meliscore_leftmenu' => array(
                    'interface' => array(
                        'melismarketing_toolstree_section' => array(
                            'interface' => array(
                                'meliscms_tools_section' => array(
                                    'conf' => array(
                                        'id' => 'id_melis_tipmail_tools_section',
                                        'name' => 'tr_melis_tipimail',
                                        'icon' => 'fa-envelope',
                                        'rights_checkbox_disable' => true,
                                    ),
                                    'interface' => array(
                                        'Tipimail_tool_access' => array(
                                            'conf' => array(
                                                'type' => '/melisTipimail/interface/Tipimail_tool_access',
                                            ),
                                        ),
                                    ),
                                ),
                            ),
                        ),
                    ),
                ),
            ),
        ),
        'melisTipimail' => array(
            'conf' => array(
                'id' => '',
                'name' => 'tr_melis_tipimail',
                'rightsDisplay' => 'none',
            ),
            'ressources' => array(
                'js' => array(
                    '/MelisTipimail/js/page/tipimail.js',
                ),
                'css' => array(),
            ),
            'datas' => array(
                'tipimail_conf' => array(
                    'default' => array(
                        'api' => array(
                            'serverURI' => '',
                            'username' => '',
                            'apikey' => '',
                            'apiVersion' => '1.8',
                            'urlWS' => '/Api/',
                            'userAgent' => 'Zend\Http\Client',
                        ),
                        'web' => array(
                            'user' => '',
                            'password' => '',
                        )
                    ),
                ),
            ),
            'interface' => array(
                'Tipimail_tool_access' => array(
                    'conf' => array(
                        'id' => 'id_melis_tool_tipimail_webaccess',
                        'name' => 'tr_melis_tipimail',
                        'melisKey' => 'melis_tool_tipimail_webaccess',
                        'icon' => 'fa-envelope',
                        'rights_checkbox_disable' => true,
                    ),
                    'forward' => array(
                        'module' => 'MelisTipimail',
                        'controller' => 'Tipimail',
                        'action' => 'webaccess',
                        'jscallback' => '',
                        'jsdatas' => array(),
                    ),
                ),
            ),
        ),

    ),

);