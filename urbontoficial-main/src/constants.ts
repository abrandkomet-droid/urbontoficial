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
