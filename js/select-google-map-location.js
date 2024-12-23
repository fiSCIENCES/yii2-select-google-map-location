/**
 * Select map location widget.
 * The widget writes the coordinates to hidden inputs when enter address into text input or move marker on the map.
 *
 * @see https://developers.google.com/maps/documentation/javascript/tutorial
 *
 * @param {Object}  options
 * @param {boolean} options.draggable Marker draggable Option
 * @param {Number} options.defaultLatitude Default latitude
 * @param {Number} options.defaultLongitude Default longitude
 * @param {String|jQuery|HTMLInputElement} options.address Address input selector
 * @param {String|jQuery|HTMLInputElement} options.name Name result from location
 * @param {String|jQuery|HTMLInputElement} options.plusCode To be use when address Street & Route not available!
 * @param {String|jQuery|HTMLInputElement} options.addressStreetNumber Street number result from location
 * @param {String|jQuery|HTMLInputElement} options.addressRoute Route result from location
 * @param {String|jQuery|HTMLInputElement} options.addressLocality City result from location
 * @param {String|jQuery|HTMLInputElement} options.addressAdmAreaLevel2 Region result from location
 * @param {String|jQuery|HTMLInputElement} options.addressAdmAreaLevel1 Province/State result from location
 * @param {String|jQuery|HTMLInputElement} options.addressPostalCode Postal code result from location
 * @param {String|jQuery|HTMLInputElement} options.addressCountry Country result from location
 * @param {String|jQuery|HTMLInputElement} options.latitude Latitude input selector
 * @param {String|jQuery|HTMLInputElement} options.longitude Longitude input selector
 * @param {Boolean} options.hideMarker Hide\show marker to selected location
 * @param {Function|undefined} options.onLoadMap Callback function to render map
 * @param {String|undefined} options.addressNotFound Description for not found address error
 */
(function ($) {
    $.fn.selectLocation = function (options) {
        let self = this;
        let map;

        // Définir initMap dans le contexte global
        window.initMap = async function () {
            const { Map } = await google.maps.importLibrary("maps");
            const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

            var mapOptions = {
                center: new google.maps.LatLng(options.defaultLatitude || 46.829853, options.defaultLongitude || -71.254028),
                zoom: options.defaultZoom || 12,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                panControl: true,
                mapId: "mapId",
            };
            map = new Map($(self).get(0), mapOptions);

            // map = new google.maps.Map($(self).get(0), mapOptions);

            if (options.onLoadMap) {
                options.onLoadMap(map);
            }

            // marker for founded point
            var marker = null;

            // create marker when map clicked
            if (options.draggable) {
                google.maps.event.addListener(map, 'click', function (e) {
                    geocodePosition(e.latLng);
                    createMarker(e.latLng);
                });
            }

            /**
             * Geocode position by selected latitude and longitude
             *
             * @param {Object} latLng google.maps.LatLng
             */
            var geocodePosition = function(latLng) {
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode(
                    {
                        latLng: latLng
                    },
                    function(results, status) {
                        if (status === google.maps.GeocoderStatus.OK) {
                            if (results[0].formatted_address) {
                                // revert geocode
                                $(options.address).val(results[0].formatted_address);
                                $(options.address).trigger('change');
                            }
                            selectLocation(results[0]);
                        }
                        return false;
                    }
                );
            };

            /**
             * Get Address components from Google Map to return
             *
             * @param {Object} results JSON
             */
            var getComponents = function(results) {
                $(options.name).val(results.name);
                $(options.name).trigger('change');
                for (let i = 0; i < results.address_components.length; i++) {
                    for (let j = 0; j < results.address_components[i].types.length; j++) {
                        if (results.address_components[i].types[j] === "plus_code") {    // Used if no address!
                            $(options.plusCode).val(results.address_components[i].long_name);
                            $(options.plusCode).trigger('change');
                        }
                        if (results.address_components[i].types[j] === "street_number") {
                            $(options.addressStreetNumber).val(results.address_components[i].long_name);
                            $(options.addressStreetNumber).trigger('change');
                        }
                        if (results.address_components[i].types[j] === "route") {
                            $(options.addressRoute).val(results.address_components[i].long_name);
                            $(options.addressRoute).trigger('change');
                        }
                        // sublocality_level_1 (i.e.: Desjardins)
                        if (results.address_components[i].types[j] === "locality") {
                            $(options.addressLocality).val(results.address_components[i].long_name);
                            $(options.addressLocality).trigger('change');
                        }
                        if (results.address_components[i].types[j] === "administrative_area_level_2") {
                            $(options.addressAdmAreaLevel2).val(results.address_components[i].long_name);
                            $(options.addressAdmAreaLevel2).trigger('change');
                        }
                        if (results.address_components[i].types[j] === "administrative_area_level_1") {
                            $(options.addressAdmAreaLevel1).val(results.address_components[i].long_name);
                            $(options.addressAdmAreaLevel1).trigger('change');
                        }
                        if (results.address_components[i].types[j] === "country") {
                            $(options.addressCountry).val(results.address_components[i].long_name);
                            $(options.addressCountry).trigger('change');
                        }
                        if (results.address_components[i].types[j] === "postal_code") {
                            $(options.addressPostalCode).val(results.address_components[i].long_name);
                            $(options.addressPostalCode).trigger('change');
                        }
                    }
                }
            }

            /**
             * Create marker into map
             *
             * Input object type - google.maps.LatLng
             *
             * @param {Object} latLng
             */
            var createMarker = function (latLng) {
                // remove older marker
                if (marker) {
                    marker.remove();
                }
                if (options.hideMarker) {
                    // do not use marker
                    return;
                }
                marker = new google.maps.marker.AdvancedMarkerElement({
                    'position': latLng,
                    'map': map,
                    'draggable': options.draggable
                });

                if (options.draggable) {
                    google.maps.event.addListener(marker, 'dragend', function () {
                        marker.changePosition(marker.getPosition());
                    });
                }

                marker.remove = function () {
                    google.maps.event.clearInstanceListeners(this);
                    this.setMap(null);
                };

                marker.changePosition = geocodePosition;
            };

            /**
             * Touch point coordinates
             *
             * @param {Object} point google.maps.LatLng
             */
            var setLatLngAttributes = function (point) {
                $(options.latitude).val(point.lat());
                $(options.longitude).val(point.lng());
            };

            /**
             * Select location with geometry
             *
             * @param {Object} item
             */
            var selectLocation = function(item) {
                if (!item.geometry) {
                    return;
                }
                getComponents(item);
                var bounds = item.geometry.viewport ? item.geometry.viewport : item.geometry.bounds;
                var center = null;
                if (bounds) {
                    map.fitBounds(new google.maps.LatLngBounds(bounds.getSouthWest(), bounds.getNorthEast()));
                }
                if (item.geometry.location) {
                    center = item.geometry.location;
                }
                else if (bounds) {
                    var lat = bounds.getSouthWest().lat() + ((bounds.getNorthEast().lat() - bounds.getSouthWest().lat()) / 2);
                    var lng = bounds.getSouthWest().lng() + ((bounds.getNorthEast().lng() - bounds.getSouthWest().lng()) / 2);
                    center = new google.maps.LatLng(lat, lng);
                }
                if (center) {
                    map.setCenter(center);
                    createMarker(center);
                    setLatLngAttributes(center);
                }
            };

            // address validation using yii.activeForm.js
            if ($(options.address).parents('form').length) {
                var $form = $(options.address).parents('form');
                $form.on('afterValidateAttribute', function (e, attribute, messages) {
                    if (attribute.input === options.address && !$(options.latitude).val() && !$(options.longitude).val() && !messages.length) {
                        // address not found
                        messages.push(options.addressNotFound);
                        e.preventDefault();
                    }
                });
            }

            // address autocomplete using google autocomplete
            var autocomplete = new google.maps.places.Autocomplete($(options.address).get(0));

            google.maps.event.addListener(autocomplete, 'place_changed', function () {
                var place = autocomplete.getPlace();
                if (!place) {
                    return;
                }
                selectLocation(place);
            });

            var defaults = {
                'lat': $(options.latitude).val(),
                'lng': $(options.longitude).val()
            };
            if (defaults.lat && defaults.lng) {
                var center = new google.maps.LatLng(defaults.lat, defaults.lng);
                map.setCenter(center);
                createMarker(center);
                setLatLngAttributes(center);
            }
        }

        $(document).ready(function () {
            initialization();
        });

        function initialization() {
        }
    };
})(jQuery);
