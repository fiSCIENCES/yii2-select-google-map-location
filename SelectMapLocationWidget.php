<?php
namespace fisciences\maplocation;

use Yii;
use yii\base\Model;
use yii\helpers\ArrayHelper;
use yii\helpers\Html;
use yii\helpers\Json;
use yii\web\JsExpression;
use yii\widgets\InputWidget;

/**
 * Widget for select map location. It\'s render google map and input field for type a map location.
 * Latitude and longitude are provided in the attributes $attributeLatitude and $attributeLongitude.
 * Add variables to define center map position as default
 * Base usage:
 *
 * $form->field($model, 'location')->widget(\app\widgets\SelectMapLocationWidget::className(), [
 *     'attributeLatitude' => 'latitude',
 *     'attributeLongitude' => 'longitude',
 * ]);
 *
 * or
 *
 * \app\widgets\SelectMapLocationWidget::widget([
 *     'model' => $model,
 *     'attribute' => 'location',
 *     'attributeLatitude' => 'latitude',
 *     'attributeLongitude' => 'longitude',
 * ]);
 *
 * @author Max Kalyabin <maksim@kalyabin.ru>
 * @package yii2-select-google-map-location
 * @copyright (c) 2015, Max Kalyabin, http://github.com/kalyabin
 *
 * @property Model $model base yii2 model or ActiveRecord object
 * @property string $attribute attribute to write map location
 * @property string $attributeName attribute to write location name
 * @property string $attributeAddressStreetNumber attribute to write location street number
 * @property string $attributeAddressRoute attribute to write location street number
 * @property string $attributeAddressLocality attribute to write location city
 * @property string $attributeAddressAdmAreaLevel2 attribute to write location region
 * @property string $attributeAddressAdmAreaLevel1 attribute to write location province/state
 * @property string $attributeAddressCountry attribute to write location country
 * @property string $attributeAddressPostalCode attribute to write location postal code
 * @property string $attributeLatitude attribute to write location latitude
 * @property string $attributeLongitude attribute to write location longitude
 * @property callable|null $renderWidgetMap custom function to render map
 */
class SelectMapLocationWidget extends InputWidget
{
    /**
     * @var string name attribute name
     */
    public $attributeName;

    /**
     * @var string addressStreetNumber attribute name
     */
    public $attributeAddressStreetNumber;

    /**
     * @var string addressRoute attribute name
     */
    public $attributeAddressRoute;

    /**
     * @var string addressLocality attribute name
     */
    public $attributeAddressLocality;

    /**
     * @var string addressAdmAreaLevel2 attribute name
     */
    public $attributeAddressAdmAreaLevel2;

    /**
     * @var string addressAdmAreaLevel1 attribute name
     */
    public $attributeAddressAdmAreaLevel1;

    /**
     * @var string addressCountry attribute name
     */
    public $attributeAddressCountry;

    /**
     * @var string addressPostalCode attribute name
     */
    public $attributeAddressPostalCode;

    /**
     * @var string latitude attribute name
     */
    public $attributeLatitude;

    /**
     * @var string longitude attribute name
     */
    public $attributeLongitude;

    /**
     * @var boolean marker draggable option
     */
    public $draggable = false;

    /**
     * @var array options for map wrapper div
     */
    public $wrapperOptions;

    /**
     * @var array options for attribute text input
     */
    public $textOptions = ['class' => 'form-control'];

    /**
     * @var array JavaScript options
     */
    public $jsOptions = [];

    /**
     * @var callable function for custom map render
     */
    public $renderWidgetMap;

    /**
     * @var string Google API Key for Google Maps
     */
    public $googleMapApiKey;

    /**
     * Run widget
     */
    public function run()
    {
        parent::run();

        if (!isset($this->wrapperOptions)) {
            $this->wrapperOptions = [];
        }
        if (!isset($this->wrapperOptions['id'])) {
            $this->wrapperOptions['id'] = $this->id;
        }
        if (!isset($this->wrapperOptions['style'])) {
            $this->wrapperOptions['style'] = 'width: 100%; height: 500px;';
        }
        SelectMapLocationAssets::$googleMapApiKey = $this->googleMapApiKey;
        SelectMapLocationAssets::register($this->view);

        // getting inputs ids
        $address = Html::getInputId($this->model, $this->attribute);
        $name = Html::getInputId($this->model, $this->attributeName);
        $addressStreetNumber = Html::getInputId($this->model, $this->attributeAddressStreetNumber);
        $addressRoute = Html::getInputId($this->model, $this->attributeAddressRoute);
        $addressLocality = Html::getInputId($this->model, $this->attributeAddressLocality);
        $addressAdmAreaLevel2 = Html::getInputId($this->model, $this->attributeAddressAdmAreaLevel2);
        $addressAdmAreaLevel1 = Html::getInputId($this->model, $this->attributeAddressAdmAreaLevel1);
        $addressCountry = Html::getInputId($this->model, $this->attributeAddressCountry);
        $addressPostalCode = Html::getInputId($this->model, $this->attributeAddressPostalCode);
        $latitude = Html::getInputId($this->model, $this->attributeLatitude);
        $longitude = Html::getInputId($this->model, $this->attributeLongitude);

        $jsOptions = ArrayHelper::merge($this->jsOptions, [
            'address'               => '#' . $address,
            'name'                  => '#' . $name,
            'addressStreetNumber'   => '#' . $addressStreetNumber,
            'addressRoute'          => '#' . $addressRoute,
            'addressLocality'       => '#' . $addressLocality,
            'addressAdmAreaLevel2'  => '#' . $addressAdmAreaLevel2,
            'addressAdmAreaLevel1'  => '#' . $addressAdmAreaLevel1,
            'addressCountry'        => '#' . $addressCountry,
            'addressPostalCode'     => '#' . $addressPostalCode,
            'latitude'              => '#' . $latitude,
            'longitude'             => '#' . $longitude,
            'draggable'             => $this->draggable,
        ]);
        // message about not founded addess
        if (!isset($jsOptions['addressNotFound'])) {
//            $hasMainCategory = isset(Yii::$app->i18n->translations['*']) || isset(Yii::$app->i18n->translations['main']);
//            $jsOptions['addressNotFound'] = $hasMainCategory ? Yii::t('main', 'Address not found') : 'Address not found';
            $jsOptions['addressNotFound'] = Yii::t('kalyabin.maplocation', 'Address not found'); //  If not found, return the message anyway! MPLT
        }
        $this->view->registerJs(new JsExpression('
            $(document).ready(function() {
                $(\'#' . $this->wrapperOptions['id'] . '\').selectLocation(' . Json::encode($jsOptions) . ');
            });
        '));
        $this->view->registerJs(new JsExpression('
            function getAddress() {
                let list = $(this).val().split(",");
                document.getElementById("sladdress-address1").innerHTML = list[0];
                document.getElementById("sladdress-city").innerHTML = list[1];
                document.getElementById("sladdress-state").innerHTML = list[2];
                document.getElementById("sladdress-country").innerHTML = list[3];
            }
        '));

        $mapHtml = Html::tag('div', '', $this->wrapperOptions);
        $mapHtml .= Html::activeHiddenInput($this->model, $this->attributeName);
        $mapHtml .= Html::activeHiddenInput($this->model, $this->attributeAddressStreetNumber);
        $mapHtml .= Html::activeHiddenInput($this->model, $this->attributeAddressRoute);
        $mapHtml .= Html::activeHiddenInput($this->model, $this->attributeAddressLocality);
        $mapHtml .= Html::activeHiddenInput($this->model, $this->attributeAddressAdmAreaLevel2);
        $mapHtml .= Html::activeHiddenInput($this->model, $this->attributeAddressAdmAreaLevel1);
        $mapHtml .= Html::activeHiddenInput($this->model, $this->attributeAddressCountry);
        $mapHtml .= Html::activeHiddenInput($this->model, $this->attributeAddressPostalCode);
        $mapHtml .= Html::activeHiddenInput($this->model, $this->attributeLatitude);
        $mapHtml .= Html::activeHiddenInput($this->model, $this->attributeLongitude);

        if (is_callable($this->renderWidgetMap)) {
            return call_user_func_array($this->renderWidgetMap, [$mapHtml]);
        }

        // replace custom template to use map after input=text
        if (strpos($this->field->template, '{map}') === false) {
            $this->field->template = preg_replace('/\{input\}/', '{input}{map}', $this->field->template);
        }

        $this->field->parts['{map}'] = $mapHtml;
        $this->textOptions['onchange'] = "getAddress()";    // $(this).val()
        return Html::activeInput('text', $this->model, $this->attribute, $this->textOptions);
    }
}
