<?php

return [
    'plugins' => [
        'meliscore' => [
            'interface' => [
                'meliscore_leftmenu' => [
                    'interface' => [
                        'melismarketing_toolstree_section' => [
                            'interface' => [
                                'meliscms_tools_section' => [
                                    'conf' => [
                                        'id' => 'id_melis_tipmail_tools_section',
                                        'name' => 'tr_melis_tipimail',
                                        'icon' => 'fa-envelope',
                                        'rights_checkbox_disable' => true,
                                    ],
                                    'interface' => [
                                        'Tipimail_tool_access' => [
                                            'conf' => [
                                                'type' => '/melisTipimail/interface/Tipimail_tool_access',
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ],
        'melisTipimail' => [
            'conf' => [
                'id' => '',
                'name' => 'tr_melis_tipimail',
                'rightsDisplay' => 'none',
            ],
            'ressources' => [
                'js' => [
                    '/MelisTipimail/js/page/tipimail.js',
                ],
                'css' => [],
            ],
            'datas' => [
                'tipimail_conf' => [
                    'default' => [
                        'api' => [
                            'serverURI' => '',
                            'username' => '',
                            'apikey' => '',
                            'apiVersion' => '1.8',
                            'urlWS' => '/Api/',
                            'userAgent' => 'Laminas\Http\Client',
                        ],
                        'web' => [
                            'user' => '',
                            'password' => '',
                        ]
                    ],
                ],
            ],
            'interface' => [
                'Tipimail_tool_access' => [
                    'conf' => [
                        'id' => 'id_melis_tool_tipimail_webaccess',
                        'name' => 'tr_melis_tipimail',
                        'melisKey' => 'melis_tool_tipimail_webaccess',
                        'icon' => 'fa-envelope',
                    ],
                    'forward' => [
                        'module' => 'MelisTipimail',
                        'controller' => 'Tipimail',
                        'action' => 'webaccess',
                        'jscallback' => '',
                        'jsdatas' => [],
                    ],
                ],
            ],
        ],
    ],
];