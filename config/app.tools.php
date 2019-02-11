<?php

return array(
    'plugins' => array(
        'melisTipimail' => array(
            'conf' => array(
                // user rights exclusions
                'rightsDisplay' => 'none',
            ),
            'tools' => array(
                'melis_tipmail_tool' => array(
                    'config' => array(
                        'url' => 'https://app.tipimail.com/#/access/login'
                    ),
                ),
            ),
        ),
    ),
);