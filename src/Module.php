<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisTipimail;

use Laminas\Mvc\ModuleRouteListener;
use Laminas\Mvc\MvcEvent;
use Laminas\ModuleManager\ModuleManager;
use Laminas\Stdlib\ArrayUtils;
use Laminas\Session\Container;

class Module
{
    public function onBootstrap(MvcEvent $e)
    {
        $eventManager        = $e->getApplication()->getEventManager();
        $moduleRouteListener = new ModuleRouteListener();
        $moduleRouteListener->attach($eventManager);

        $this->createTranslations($e);
        
    }

    public function getConfig()
    {
        $config = [];
        $configFiles = [
                include __DIR__ . '/../config/module.config.php',
                // React back-office API: routes + controller/invokable for the
                // /melis/react-api/tipimail* endpoints consumed by the module's native
                // React brick (public/ui-react/). See config/react-api.php.
                include __DIR__ . '/../config/react-api.php',
                include __DIR__ . '/../config/app.interface.php',
                include __DIR__ . '/../config/app.tools.php',
                // Tool capabilities (advanced-rights checkboxes in the Rights tab)
                include __DIR__ . '/../config/react.capabilities.php',
        ];
        
        foreach ($configFiles as $file) {
            $config = ArrayUtils::merge($config, $file);
        } 
        
        return $config;
    }

    public function getAutoloaderConfig()
    {
        return [
            'Laminas\Loader\StandardAutoloader' => [
                'namespaces' => [
                    // Module.php lives in src/ (PSR-4 MelisTipimail\ => src/), so the namespace base
                    // is __DIR__ (= src/), NOT __DIR__.'/src/'.__NAMESPACE__ (which resolves to the
                    // nonexistent src/src/MelisTipimail). The wrong path meant that when this module
                    // is NOT composer-installed (loaded via application.config.php module_paths on the
                    // stale Docker vendor volume), its sub-classes (Controller) failed to autoload —
                    // the Tipimail webaccess tool 500'd. (Same fix as MelisCron/MelisNewsletter.)
                    __NAMESPACE__ => __DIR__,
                ],
            ],
        ];
    }

    public function createTranslations($e)
    {
        $sm = $e->getApplication()->getServiceManager();
        $translator = $sm->get('translator');

        $container = new Container('meliscore');
        $locale = $container['melis-lang-locale'];


        if (!empty($locale)){

            $translationType = [
                'interface',
            ];

            $translationList = [];
            if(file_exists($_SERVER['DOCUMENT_ROOT'].'/../module/MelisModuleConfig/config/translation.list.php')){
                $translationList = include 'module/MelisModuleConfig/config/translation.list.php';
            }

            foreach($translationType as $type){

                $transPath = '';
                $moduleTrans = __NAMESPACE__."/$locale.$type.php";

                if(in_array($moduleTrans, $translationList)){
                    $transPath = "module/MelisModuleConfig/languages/".$moduleTrans;
                }

                if(empty($transPath)){

                    // if translation is not found, use melis default translations
                    $defaultLocale = (file_exists(__DIR__ . "/../language/$locale.$type.php"))? $locale : "en_EN";
                    $transPath = __DIR__ . "/../language/$defaultLocale.$type.php";
                }

                $translator->addTranslationFile('phparray', $transPath);
            }
        }
    }
}
