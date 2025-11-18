export interface User {
  id: string;
  name: string;
  email: string;
  tipo: 'basic' | 'premium' | 'admin';
}