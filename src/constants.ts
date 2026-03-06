export interface Country {
  name: string;
  code: string;
  placeholder: string;
  maxLength: number;
}

export const COUNTRIES: Country[] = [
  { name: 'Alemania', code: '+49', placeholder: '150 000 0000', maxLength: 11 },
  { name: 'Arabia Saudí', code: '+966', placeholder: '50 000 0000', maxLength: 9 },
  { name: 'Canadá', code: '+1', placeholder: '613 000 0000', maxLength: 10 },
  { name: 'Emiratos Árabes Unidos', code: '+971', placeholder: '50 000 0000', maxLength: 9 },
  { name: 'España', code: '+34', placeholder: '600 000 000', maxLength: 9 },
  { name: 'Estados Unidos', code: '+1', placeholder: '201 555 0123', maxLength: 10 },
  { name: 'Francia', code: '+33', placeholder: '6 00 00 00 00', maxLength: 9 },
  { name: 'Italia', code: '+39', placeholder: '300 000 0000', maxLength: 10 },
  { name: 'Japón', code: '+81', placeholder: '90 0000 0000', maxLength: 10 },
  { name: 'México', code: '+52', placeholder: '55 0000 0000', maxLength: 10 },
  { name: 'Mónaco', code: '+377', placeholder: '0 00 00 00 00', maxLength: 9 },
  { name: 'Qatar', code: '+974', placeholder: '3000 0000', maxLength: 8 },
  { name: 'Reino Unido', code: '+44', placeholder: '7000 000000', maxLength: 10 },
  { name: 'Singapur', code: '+65', placeholder: '8000 0000', maxLength: 8 },
  { name: 'Suiza', code: '+41', placeholder: '70 000 00 00', maxLength: 9 },
].sort((a, b) => a.name.localeCompare(b.name));

export const COMMON_COUNTRIES = COUNTRIES.filter(c => 
  ['Estados Unidos', 'Reino Unido', 'España', 'Emiratos Árabes Unidos', 'Francia'].includes(c.name)
);

export const NAVY_SILVER_STYLE = [
  { "elementType": "geometry", "stylers": [{ "color": "#1a1c2c" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#8e9297" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1a1c2c" }] },
  { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#4b4e6d" }] },
  { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#6477b9" }] },
  { "featureType": "landscape.man_made", "elementType": "geometry.stroke", "stylers": [{ "color": "#334e7c" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#283d5a" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#6f9ba5" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#304a7d" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#98a5be" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#2c4591" }] },
  { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f2835" }] },
  { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#b0d5ff" }] },
  { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#2f3948" }] },
  { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [{ "color": "#d3d3d3" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0e1626" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#4e6d70" }] }
];
