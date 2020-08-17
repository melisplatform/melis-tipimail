<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisTipimail\Controller;

use MelisCore\Controller\MelisAbstractActionController;
use Laminas\View\Model\ViewModel;
use Laminas\View\Model\JsonModel;
use Laminas\Session\Container;

/**
 * This class renders Melis CMS Page tab properties
 */
class TipimailController extends MelisAbstractActionController
{
    const TOOL_KEY = 'melis_tipmail_tool';
    /**
     * Makes the rendering of the Page Versioning Tab
     * @return \Laminas\View\Model\ViewModel
     */
    public function webaccessAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $config = $this->getServiceManager()->get('MelisCoreConfig');

        $tipiMailUrl  = $config->getItem("melisTipimail/tools/melis_tipmail_tool/config");
        $tipiMailUrl = $tipiMailUrl['url'];

        $melisCoreRights = $this->getServiceManager()->get('MelisCoreRights');
        if(!$melisCoreRights->canAccess($this::TOOL_KEY)) {
            $noAccessPrompt = $this->getTool()->getTranslation('tr_tool_no_access');
        }

        /**
         * Send back the view and add the form config inside
         */

        $view = new ViewModel();
        $view->url = $tipiMailUrl;
        $view->melisKey = $melisKey;

        return $view;
    }
    private function getTool()
    {
        /** @var MelisCoreToolService $toolSvc */
        $toolSvc = $this->getServiceManager()->get('MelisCoreTool');
        $toolSvc->setMelisToolKey('MelisTipmail', 'melis_tipmail_tool');
        return $toolSvc;
    }
}
