<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisTipimail\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Zend\View\Model\JsonModel;
use Zend\Session\Container;

/**
 * This class renders Melis CMS Page tab properties
 */
class TipimailController extends AbstractActionController
{
    const TOOL_KEY = 'melis_tipmail_tool';
    /**
     * Makes the rendering of the Page Versioning Tab
     * @return \Zend\View\Model\ViewModel
     */
    public function webaccessAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $melisCoreRights = $this->getServiceLocator()->get('MelisCoreRights');
        if(!$melisCoreRights->canAccess($this::TOOL_KEY)) {
            $noAccessPrompt = $this->getTool()->getTranslation('tr_tool_no_access');
        }

        /**
         * Send back the view and add the form config inside
         */
        $view = new ViewModel();
        $view->melisKey = $melisKey;

        return $view;
    }
    private function getTool()
    {
        /** @var MelisCoreToolService $toolSvc */
        $toolSvc = $this->getServiceLocator()->get('MelisCoreTool');
        $toolSvc->setMelisToolKey('MelisTipmail', 'melis_tipmail_tool');
        return $toolSvc;
    }
}
